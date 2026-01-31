/*
  # Add Admin Role and Enhanced Security

  ## Overview
  This migration adds admin role functionality and restricts write access to admin users only.

  ## Changes
  
  1. Helper Functions
    - `is_admin()` - Function to check if current user has admin role
    - Checks auth.jwt() for admin role in app_metadata
  
  2. Security Updates
    - Drop existing permissive RLS policies for products
    - Create new restrictive policies:
      - Public can read products
      - Only admins can insert, update, delete products
      - Only admins can update orders and order statuses
  
  3. Notes
    - Admin users must have `{"role": "admin"}` in their app_metadata
    - This can be set manually in Supabase Dashboard or via service role
*/

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(
    (SELECT (auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin'),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing permissive product policies
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Create new restrictive policies for products
CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin());

-- Update order policies to restrict modifications to admins only
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

CREATE POLICY "Only admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update order items policies
DROP POLICY IF EXISTS "Authenticated users can update order items" ON order_items;

CREATE POLICY "Only admins can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());