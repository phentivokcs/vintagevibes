/*
  # Fix Order Status Type Conversion
  
  ## Changes
  - Drop the status check constraint
  - Drop the existing trigger temporarily
  - Convert orders.status from text to order_status enum
  - Recreate the trigger
  
  ## Background
  The orders.status field needs to be converted to the order_status enum type.
  This migration removes the old text-based check constraint and properly converts the type.
*/

-- Drop the trigger temporarily
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;

-- Drop the old check constraint (will be replaced by enum)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- First, update any existing orders to have valid status values
UPDATE orders 
SET status = CASE 
  WHEN status = 'pending' THEN 'processing'
  WHEN status = 'paid' THEN 'processing'
  WHEN status = 'completed' THEN 'delivered'
  WHEN status IN ('processing', 'packed', 'shipped', 'delivered', 'cancelled') THEN status
  ELSE 'processing'
END
WHERE status IS NOT NULL;

-- Set default for null values
UPDATE orders SET status = 'processing' WHERE status IS NULL OR status = '';

-- Now convert the column type
ALTER TABLE orders 
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE orders 
  ALTER COLUMN status TYPE order_status 
  USING CASE 
    WHEN status = 'pending' THEN 'processing'::order_status
    WHEN status = 'paid' THEN 'processing'::order_status
    WHEN status = 'completed' THEN 'delivered'::order_status
    WHEN status = 'processing' THEN 'processing'::order_status
    WHEN status = 'packed' THEN 'packed'::order_status
    WHEN status = 'shipped' THEN 'shipped'::order_status
    WHEN status = 'delivered' THEN 'delivered'::order_status
    WHEN status = 'cancelled' THEN 'cancelled'::order_status
    ELSE 'processing'::order_status
  END;

-- Set default and not null constraint
ALTER TABLE orders 
  ALTER COLUMN status SET DEFAULT 'processing'::order_status;

ALTER TABLE orders 
  ALTER COLUMN status SET NOT NULL;

-- Recreate the trigger
CREATE TRIGGER order_status_change_trigger
  BEFORE INSERT OR UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();
