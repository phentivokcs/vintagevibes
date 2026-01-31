/*
  # Add Packeta API Password field
  
  1. Changes
    - Add `packeta_api_password` column to `site_settings` table
    - This stores the longer API password used for Packeta API calls (shipment creation)
    - The existing `packeta_api_key` is the shorter key used for the widget
  
  2. Notes
    - API key (short) = used for Packeta widget initialization
    - API password (long) = used for Packeta API calls like creating shipments
*/

-- Add packeta_api_password column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'packeta_api_password'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN packeta_api_password text;
  END IF;
END $$;