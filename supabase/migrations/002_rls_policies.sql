-- Admin helper
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
      AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL USING (is_admin());

-- Categories
CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (
  (is_active = true AND deleted_at IS NULL) OR is_admin()
);
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (is_admin());

-- Products
CREATE POLICY "Public read active products" ON products FOR SELECT USING (
  (is_active = true AND deleted_at IS NULL) OR is_admin()
);
CREATE POLICY "Admins manage products" ON products FOR ALL USING (is_admin());

-- Product images
CREATE POLICY "Public read product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON product_images FOR ALL USING (is_admin());

-- Product variants
CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (deleted_at IS NULL OR is_admin());
CREATE POLICY "Admins manage variants" ON product_variants FOR ALL USING (is_admin());

-- Inventory
CREATE POLICY "Admins manage inventory" ON inventory FOR ALL USING (is_admin());
CREATE POLICY "Admins read inventory" ON inventory FOR SELECT USING (is_admin());

-- Inventory movements
CREATE POLICY "Admins manage movements" ON inventory_movements FOR ALL USING (is_admin());

-- Addresses
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id OR is_admin());

-- Carts
CREATE POLICY "Users manage own carts" ON carts FOR ALL USING (
  auth.uid() = user_id OR session_id IS NOT NULL OR is_admin()
);

-- Cart items
CREATE POLICY "Users manage own cart items" ON cart_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM carts c
    WHERE c.id = cart_id
      AND (c.user_id = auth.uid() OR c.session_id IS NOT NULL OR is_admin())
  )
);

-- Orders
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins manage orders" ON orders FOR UPDATE USING (is_admin());
CREATE POLICY "Admins delete orders" ON orders FOR DELETE USING (is_admin());

-- Order items
CREATE POLICY "Users view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "Users create order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "Admins manage order items" ON order_items FOR ALL USING (is_admin());

-- Payments
CREATE POLICY "Users view own payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "Admins manage payments" ON payments FOR ALL USING (is_admin());

-- Coupons
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (
  (is_active = true AND deleted_at IS NULL) OR is_admin()
);
CREATE POLICY "Admins manage coupons" ON coupons FOR ALL USING (is_admin());

-- Coupon usage
CREATE POLICY "Users view own coupon usage" ON coupon_usage FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "System insert coupon usage" ON coupon_usage FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

-- Reviews
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (is_approved = true OR auth.uid() = user_id OR is_admin());
CREATE POLICY "Users create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage reviews" ON reviews FOR ALL USING (is_admin());

-- Wishlists
CREATE POLICY "Users manage wishlists" ON wishlists FOR ALL USING (auth.uid() = user_id OR is_admin());

-- Banners
CREATE POLICY "Public read active banners" ON banners FOR SELECT USING ((is_active = true AND deleted_at IS NULL) OR is_admin());
CREATE POLICY "Admins manage banners" ON banners FOR ALL USING (is_admin());

-- Settings
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON settings FOR ALL USING (is_admin());

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true);

CREATE POLICY "Public read product images storage" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admins update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Public read category images storage" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "Admins upload category images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'category-images' AND is_admin());
CREATE POLICY "Admins update category images" ON storage.objects FOR UPDATE USING (bucket_id = 'category-images' AND is_admin());
CREATE POLICY "Admins delete category images" ON storage.objects FOR DELETE USING (bucket_id = 'category-images' AND is_admin());
