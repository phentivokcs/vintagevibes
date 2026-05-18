/*
  # Add Barion Payee Email to Site Settings

  1. Changes
    - Add `barion_payee_email` column to `site_settings` table
    - This stores the email address registered in Barion that receives payments
  
  2. Notes
    - The Payee field in Barion API must be a valid email registered in your Barion account
    - This is different from the customer's email
    - Required for successful payment initialization
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'barion_payee_email'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN barion_payee_email text;
  END IF;
END $$;