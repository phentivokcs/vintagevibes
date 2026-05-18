/*
  # Create site settings table for hero banner and design customization

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `hero_image` (text) - URL to hero banner image
      - `hero_title` (text) - Main hero banner title
      - `hero_subtitle` (text) - Hero banner subtitle/description
      - `hero_tags` (jsonb) - Array of tag labels for hero section
      - `primary_button_text` (text) - Primary CTA button text
      - `secondary_button_text` (text) - Secondary CTA button text
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `site_settings` table
    - Anyone can read settings (public site content)
    - Only admins can update settings
  
  3. Default Values
    - Insert default hero banner settings
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_image text DEFAULT '/chatgpt_image_2025._nov._9._01_19_15.png',
  hero_title text DEFAULT 'Archive streetwear. Clean drops.',
  hero_subtitle text DEFAULT 'Nike / Tommy / TNF / adidas – handpicked, measured, ready to ship.',
  hero_tags jsonb DEFAULT '["curated vintage", "90s streetwear", "daily drops"]'::jsonb,
  primary_button_text text DEFAULT 'Shop now',
  secondary_button_text text DEFAULT 'New arrivals',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin'
  )
  WITH CHECK (
    (SELECT auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin'
  );

CREATE POLICY "Only admins can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin'
  );

INSERT INTO site_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;
