/*
  # Add Gender Field to Products

  ## Changes
  - Add `gender` column to `products` table
    - Type: text
    - Values: 'Férfi' or 'Női'
    - Default: 'Férfi'
    - Required field (NOT NULL)

  ## Notes
  - This allows products to be categorized by gender
  - All existing products will be set to 'Férfi' by default
*/

-- Add gender column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'gender'
  ) THEN
    ALTER TABLE products ADD COLUMN gender text NOT NULL DEFAULT 'Férfi' CHECK (gender IN ('Férfi', 'Női'));
  END IF;
END $$;

-- Create index for gender filtering
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);