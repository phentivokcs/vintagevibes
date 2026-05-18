/*
  # Add shipping_name column to orders table

  1. Changes
    - Add `shipping_name` column to `orders` table to store the recipient's name
    - This column is used by the Packeta shipment creation and payment processing

  2. Notes
    - Column is nullable to support existing orders
    - Uses text type for name storage
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_name text;
  END IF;
END $$;