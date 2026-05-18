/*
  # Add Barion Payment Support

  ## Changes to orders table
  - Add `payment_id` - Barion payment identifier
  - Add `payment_status` - Current payment status (prepared, started, succeeded, failed, cancelled)
  - Add `payment_method` - Payment method (barion, cash_on_delivery)
  - Add `barion_transaction_id` - Barion transaction ID for tracking
  - Add `payment_redirect_url` - URL to redirect user to Barion payment page

  ## Changes to site_settings table
  - Add `barion_pos_key` - Barion API key (POSKey)
  - Add `barion_environment` - test or production
  - Add `barion_pixel_id` - Optional Barion Pixel ID for conversion tracking

  ## Security
  - Maintains existing RLS policies on both tables
*/

-- Add Barion payment fields to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending' CHECK (
      payment_status IN ('pending', 'prepared', 'started', 'succeeded', 'failed', 'cancelled', 'expired')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'barion' CHECK (
      payment_method IN ('barion', 'cash_on_delivery')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'barion_transaction_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN barion_transaction_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_redirect_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_redirect_url text;
  END IF;
END $$;

-- Add Barion configuration fields to site_settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'barion_pos_key'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN barion_pos_key text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'barion_environment'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN barion_environment text DEFAULT 'test' CHECK (
      barion_environment IN ('test', 'production')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'barion_pixel_id'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN barion_pixel_id text;
  END IF;
END $$;

-- Create index on payment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);