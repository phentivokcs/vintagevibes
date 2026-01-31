/*
  # Add Barion logo to site settings

  1. Changes
    - Add `barion_logo` column to `site_settings` table to store the Barion payment logo URL
    - This allows admins to customize the Barion logo shown on the checkout page
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'barion_logo'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN barion_logo text DEFAULT '/medium-nobg-light.png';
  END IF;
END $$;