-- Create Storage Buckets for public media assets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', true),
  ('avatars', 'avatars', true),
  ('category-images', 'category-images', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- ── STORAGE POLICIES FOR PRODUCT IMAGES BUCKET ──────────────────────────────
CREATE POLICY "Public read product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin update product-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin delete product-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND public.is_admin());

-- ── STORAGE POLICIES FOR AVATARS BUCKET ─────────────────────────────────────
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload/update avatars in their own directory ({user_id}/*)
CREATE POLICY "User upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "User update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admin manage avatars" ON storage.objects
  FOR ALL USING (bucket_id = 'avatars' AND public.is_admin());

-- ── STORAGE POLICIES FOR CATEGORY IMAGES BUCKET ─────────────────────────────
CREATE POLICY "Public read category-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'category-images');

CREATE POLICY "Admin manage category-images" ON storage.objects
  FOR ALL USING (bucket_id = 'category-images' AND public.is_admin());

-- ── STORAGE POLICIES FOR BANNERS BUCKET ─────────────────────────────────────
CREATE POLICY "Public read banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Admin manage banners" ON storage.objects
  FOR ALL USING (bucket_id = 'banners' AND public.is_admin());
