/*
  # Inventory Reservation System

  ## Overview
  Adds reservation functionality to prevent double-selling of vintage items.
  Critical for single-stock items where multiple users might try to purchase simultaneously.

  ## Changes to `products` table
  
  ### New Columns
  - `reserved_until` (timestamptz, nullable) - Timestamp when reservation expires (15 min from reservation)
  - `reserved_by` (text, nullable) - Session ID or user identifier who reserved the item
  - `inventory_status` (text) - Tracks item state: 'available', 'reserved', 'sold'

  ### Updated Columns
  - Add default value for `inventory_status` = 'available'
  - Add check constraint for valid inventory_status values

  ## New Functions

  ### `reserve_product(product_id, session_id, minutes)`
  Atomically reserves a product for a specific session if available.
  - Checks if product is available (not sold, not currently reserved)
  - Sets reserved_until to now() + interval
  - Sets reserved_by to session_id
  - Updates inventory_status to 'reserved'
  - Returns success/failure with error message

  ### `release_reservation(product_id, session_id)`
  Releases a reservation if owned by the session.
  - Verifies session owns the reservation
  - Clears reserved_until and reserved_by
  - Sets inventory_status back to 'available'

  ### `complete_purchase(product_id, session_id)`
  Finalizes purchase after successful payment.
  - Verifies session owns the reservation
  - Sets stock to 0
  - Sets sold to true
  - Sets inventory_status to 'sold'

  ### `cleanup_expired_reservations()`
  Automatically releases expired reservations.
  - Finds products where reserved_until < now()
  - Clears reservation fields
  - Sets inventory_status to 'available'

  ## Security
  - All functions use row-level locking (FOR UPDATE) to prevent race conditions
  - Transaction isolation ensures atomic operations
  - Reservation ownership verification prevents hijacking

  ## Notes
  - Reservation timeout: 15 minutes (configurable)
  - Frontend should call cleanup_expired_reservations periodically
  - Consider adding a cron job for automatic cleanup
*/

-- Add reservation columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'reserved_until'
  ) THEN
    ALTER TABLE products ADD COLUMN reserved_until timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'reserved_by'
  ) THEN
    ALTER TABLE products ADD COLUMN reserved_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'inventory_status'
  ) THEN
    ALTER TABLE products ADD COLUMN inventory_status text DEFAULT 'available' 
      CHECK (inventory_status IN ('available', 'reserved', 'sold'));
  END IF;
END $$;

-- Update existing products to have correct inventory_status
UPDATE products 
SET inventory_status = CASE 
  WHEN sold = true THEN 'sold'
  WHEN stock <= 0 THEN 'sold'
  ELSE 'available'
END
WHERE inventory_status IS NULL;

-- Create index for faster reservation queries
CREATE INDEX IF NOT EXISTS idx_products_reservation ON products(inventory_status, reserved_until);

-- Function: Reserve a product atomically
CREATE OR REPLACE FUNCTION reserve_product(
  p_product_id uuid,
  p_session_id text,
  p_minutes integer DEFAULT 15
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product products%ROWTYPE;
  v_result json;
BEGIN
  -- Lock the product row for update
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Check if product exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Product not found'
    );
  END IF;

  -- Check if product is sold
  IF v_product.sold = true OR v_product.stock <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Product is sold out'
    );
  END IF;

  -- Check if product is already reserved and not expired
  IF v_product.reserved_until IS NOT NULL 
     AND v_product.reserved_until > now() 
     AND v_product.reserved_by != p_session_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Product is currently reserved by another customer',
      'reserved_until', v_product.reserved_until
    );
  END IF;

  -- Reserve the product
  UPDATE products
  SET 
    reserved_until = now() + (p_minutes || ' minutes')::interval,
    reserved_by = p_session_id,
    inventory_status = 'reserved'
  WHERE id = p_product_id;

  RETURN json_build_object(
    'success', true,
    'reserved_until', now() + (p_minutes || ' minutes')::interval,
    'message', 'Product reserved successfully'
  );
END;
$$;

-- Function: Release a reservation
CREATE OR REPLACE FUNCTION release_reservation(
  p_product_id uuid,
  p_session_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product products%ROWTYPE;
BEGIN
  -- Lock the product row
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Product not found'
    );
  END IF;

  -- Check if this session owns the reservation
  IF v_product.reserved_by != p_session_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You do not own this reservation'
    );
  END IF;

  -- Release the reservation
  UPDATE products
  SET 
    reserved_until = NULL,
    reserved_by = NULL,
    inventory_status = 'available'
  WHERE id = p_product_id AND NOT sold;

  RETURN json_build_object(
    'success', true,
    'message', 'Reservation released'
  );
END;
$$;

-- Function: Complete purchase (called after successful payment)
CREATE OR REPLACE FUNCTION complete_purchase(
  p_product_id uuid,
  p_session_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product products%ROWTYPE;
BEGIN
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Product not found'
    );
  END IF;

  -- Verify reservation ownership
  IF v_product.reserved_by != p_session_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid reservation'
    );
  END IF;

  -- Mark as sold
  UPDATE products
  SET 
    stock = 0,
    sold = true,
    inventory_status = 'sold',
    reserved_until = NULL,
    reserved_by = NULL
  WHERE id = p_product_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Purchase completed'
  );
END;
$$;

-- Function: Cleanup expired reservations
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE products
  SET 
    reserved_until = NULL,
    reserved_by = NULL,
    inventory_status = 'available'
  WHERE 
    reserved_until IS NOT NULL 
    AND reserved_until < now()
    AND NOT sold;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'released_count', v_count
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION reserve_product(uuid, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION release_reservation(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION complete_purchase(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_reservations() TO anon, authenticated;