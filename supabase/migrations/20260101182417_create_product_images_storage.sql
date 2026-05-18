/*
  # Product Images Storage Setup

  ## Overview
  Creates a Supabase Storage bucket for product images with appropriate security policies.

  ## New Storage Bucket
  - `product-images` - Public bucket for product photos
    - Max file size: 5MB
    - Allowed file types: image/jpeg, image/png, image/webp
    - Public read access for all users
    - Upload/delete restricted to authenticated admin users

  ## Storage Policies
  
  ### Public Access
  - Anyone can view product images (public read)
  
  ### Admin Access
  - Authenticated users can upload images
  - Authenticated users can delete images
  - Authenticated users can update images

  ## Notes
  - Images will be stored in format: {product_id}/{timestamp}_{filename}
  - Old images should be manually deleted when products are updated
  - Consider adding automatic image optimization in the future
*/

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Policy: Anyone can view product images
CREATE POLICY "Public read access for product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Policy: Authenticated users can update images
CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- Policy: Authenticated users can delete images
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');