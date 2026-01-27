/*
  # Add footer logo to site settings

  1. Changes
    - Add `footer_logo` column to `site_settings` table
      - Type: text (URL to footer logo image)
      - Default: '/medium-nobg-light.png'
  
  2. Purpose
    - Allow admins to upload and customize the footer logo via admin panel
    - Display payment provider or brand logo in site footer
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'footer_logo'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN footer_logo text DEFAULT '/medium-nobg-light.png';
  END IF;
END $$;