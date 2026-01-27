/*
  # Packeta Integration

  1. Changes to `orders` table
    - Add `packeta_point_id` - Selected pickup point ID
    - Add `packeta_point_name` - Pickup point name for display
    - Add `packeta_point_address` - Full pickup point address
    - Add `packeta_packet_id` - Packeta's packet ID after creation
    - Add `packeta_tracking_url` - Direct tracking URL
    - Add `packeta_label_url` - PDF label download URL
    - Add `packeta_barcode` - Package barcode

  2. Changes to `site_settings` table
    - Add `packeta_api_key` - Packeta API password/token
    - Add `packeta_api_id` - Packeta API ID (sender identification)
    - Add `packeta_sender_name` - Sender name for labels
    - Add `packeta_sender_phone` - Sender phone for labels
    - Add `packeta_enabled` - Enable/disable Packeta shipping

  3. Security
    - Policies updated to allow access to Packeta fields
*/

-- Add Packeta fields to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'packeta_point_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN packeta_point_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'packeta_point_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN packeta_point_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'packeta_point_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN packeta_point_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'packeta_packet_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN packeta_packet_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'packeta_tracking_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN packeta_tracking_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'packeta_label_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN packeta_label_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'packeta_barcode'
  ) THEN
    ALTER TABLE orders ADD COLUMN packeta_barcode text;
  END IF;
END $$;

-- Add Packeta fields to site_settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'packeta_api_key'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN packeta_api_key text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'packeta_api_id'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN packeta_api_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'packeta_sender_name'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN packeta_sender_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'packeta_sender_phone'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN packeta_sender_phone text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'packeta_enabled'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN packeta_enabled boolean DEFAULT false;
  END IF;
END $$;