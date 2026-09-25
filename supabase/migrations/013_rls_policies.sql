-- Enable Row Level Security on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_metrics ENABLE ROW LEVEL SECURITY;

-- ── PROFILES POLICIES ───────────────────────────────────────────────────────
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ── CATEGORIES POLICIES ─────────────────────────────────────────────────────
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admin manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- ── PRODUCTS POLICIES ───────────────────────────────────────────────────────
CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admin manage products" ON public.products
  FOR ALL USING (public.is_admin());

-- ── PRODUCT IMAGES POLICIES ─────────────────────────────────────────────────
CREATE POLICY "Public read product_images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Admin manage product_images" ON public.product_images
  FOR ALL USING (public.is_admin());

-- ── CART ITEMS POLICIES ─────────────────────────────────────────────────────
CREATE POLICY "Users view own cart" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own cart" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own cart" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own cart" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- ── ORDERS POLICIES ─────────────────────────────────────────────────────────
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Order creation is managed by Express API / Service Role, but allowed for auth user creating their own order
CREATE POLICY "Users insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- ── ORDER ITEMS POLICIES ────────────────────────────────────────────────────
CREATE POLICY "Users view own order_items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admin manage order_items" ON public.order_items
  FOR ALL USING (public.is_admin());

-- ── PAYMENTS POLICIES ───────────────────────────────────────────────────────
CREATE POLICY "Users view own order payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admin manage payments" ON public.payments
  FOR ALL USING (public.is_admin());

-- ── RATINGS POLICIES ────────────────────────────────────────────────────────
CREATE POLICY "Public read ratings" ON public.ratings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert ratings" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND guest_email IS NOT NULL));

CREATE POLICY "Admin manage ratings" ON public.ratings
  FOR ALL USING (public.is_admin());

-- ── SALES TRACKING & INVENTORY METRICS POLICIES ──────────────────────────────
CREATE POLICY "Admin read sales_tracking" ON public.sales_tracking
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin manage sales_tracking" ON public.sales_tracking
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin read inventory_metrics" ON public.inventory_metrics
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin manage inventory_metrics" ON public.inventory_metrics
  FOR ALL USING (public.is_admin());
