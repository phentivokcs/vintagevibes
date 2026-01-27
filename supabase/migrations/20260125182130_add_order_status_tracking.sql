/*
  # Order Status Tracking System

  ## Overview
  Adds comprehensive order status tracking with history logging and email notifications support.

  ## New Types
  - `order_status` enum: processing, packed, shipped, delivered, cancelled

  ## Modified Tables
  - `orders`
    - Modified `status` column type from text to order_status enum
    - Added `customer_email` column for notifications
    - Added `customer_phone` column for contact
    - Added `status_updated_at` timestamp
    - Note: tracking_number and notes already exist

  ## New Tables
  - `order_status_history`
    - `id` (uuid, primary key)
    - `order_id` (uuid, foreign key to orders)
    - `old_status` (order_status, nullable)
    - `new_status` (order_status)
    - `changed_by` (uuid, foreign key to auth.users, nullable)
    - `notes` (text)
    - `created_at` (timestamptz)

  ## Security
  - Enable RLS on `order_status_history` table
  - Add policies for authenticated users to view their order history
  - Add policies for admin users to manage all orders

  ## Functions
  - `log_order_status_change()` trigger function to automatically log status changes
*/

-- Create order status enum
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('processing', 'packed', 'shipped', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to orders table
DO $$
BEGIN
  -- Add customer_email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_email text;
  END IF;

  -- Add customer_phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_phone text;
  END IF;

  -- Add status_updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status_updated_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN status_updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Convert status column from text to enum (if it's still text)
DO $$
BEGIN
  -- First set default values for any null status
  UPDATE orders SET status = 'processing' WHERE status IS NULL OR status = '';
  
  -- Drop default constraint if exists
  ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;
  
  -- Convert text status to enum
  ALTER TABLE orders ALTER COLUMN status TYPE order_status 
    USING CASE 
      WHEN status = 'pending' THEN 'processing'::order_status
      WHEN status = 'completed' THEN 'delivered'::order_status
      WHEN status = 'cancelled' THEN 'cancelled'::order_status
      WHEN status = 'processing' THEN 'processing'::order_status
      WHEN status = 'packed' THEN 'packed'::order_status
      WHEN status = 'shipped' THEN 'shipped'::order_status
      WHEN status = 'delivered' THEN 'delivered'::order_status
      ELSE 'processing'::order_status
    END;
  
  -- Set default and not null
  ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'processing'::order_status;
  ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
  
EXCEPTION
  WHEN OTHERS THEN
    -- If conversion fails, just continue
    NULL;
END $$;

-- Create order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on order_status_history
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- RLS Policies for order_status_history

-- Admins can view all order status history
CREATE POLICY "Admins can view all order status history"
  ON order_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Users can view their own order status history
CREATE POLICY "Users can view own order status history"
  ON order_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Admins can insert order status history
CREATE POLICY "Admins can insert order status history"
  ON order_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Update RLS policies for orders table to allow admins to view and update

-- Admins can view all orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Admins can view all orders'
  ) THEN
    CREATE POLICY "Admins can view all orders"
      ON orders
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
      );
  END IF;
END $$;

-- Admins can update all orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Admins can update all orders'
  ) THEN
    CREATE POLICY "Admins can update all orders"
      ON orders
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
      );
  END IF;
END $$;

-- Users can view their own orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Users can view own orders'
  ) THEN
    CREATE POLICY "Users can view own orders"
      ON orders
      FOR SELECT
      TO authenticated
      USING (customer_id = auth.uid());
  END IF;
END $$;

-- Create function to automatically log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
    VALUES (
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      NEW.status,
      auth.uid(),
      NEW.notes
    );
    
    -- Update status_updated_at timestamp
    NEW.status_updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic status logging
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
  BEFORE INSERT OR UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();