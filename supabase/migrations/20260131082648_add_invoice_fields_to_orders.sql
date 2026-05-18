/*
  # Add Invoice Fields to Orders

  1. Changes
    - Add `invoice_number` column to store Billingo invoice number
    - Add `invoice_id` column to store Billingo invoice ID
    - Add `invoice_url` column to store public invoice URL

  2. Security
    - Columns are nullable (invoices may not be generated for all orders)
    - Existing RLS policies apply to these columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN invoice_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'invoice_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN invoice_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'invoice_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN invoice_url text;
  END IF;
END $$;