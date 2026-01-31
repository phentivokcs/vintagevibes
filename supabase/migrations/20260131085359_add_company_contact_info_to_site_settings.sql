/*
  # Add Company Contact Information to Site Settings

  1. Changes
    - Add `company_phone` column to store company phone number for ÁSZF
    - Add `company_registration_number` column to store company registration number (cégjegyzékszám) for ÁSZF
    - These fields are required by Barion to be displayed in Terms and Conditions
  
  2. Notes
    - Fields are optional (nullable) to maintain backward compatibility
    - Used for displaying company contact information in legal documents
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'company_phone'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN company_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'company_registration_number'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN company_registration_number text;
  END IF;
END $$;