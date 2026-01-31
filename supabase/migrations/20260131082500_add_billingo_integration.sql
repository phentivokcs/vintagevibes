/*
  # Add Billingo Integration Settings

  1. Changes
    - Add `billingo_api_key` column to store Billingo API key (encrypted text)
    - Add `billingo_block_id` column to store the Billingo block/organization ID
    - Add `billingo_enabled` column to enable/disable automatic invoice generation

  2. Security
    - Columns are nullable to allow gradual configuration
    - Existing RLS policies apply to these columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'billingo_api_key'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN billingo_api_key text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'billingo_block_id'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN billingo_block_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'billingo_enabled'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN billingo_enabled boolean DEFAULT false;
  END IF;
END $$;