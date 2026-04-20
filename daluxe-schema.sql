-- ============================================================
-- DALUXE — SCHEMA v4  (bulletproof, handles any existing state)
-- ============================================================

-- ── STEP 1: ENUM TYPES ───────────────────────────────────────
DO $$ BEGIN CREATE TYPE user_role     AS ENUM ('customer','admin');        EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE regimen_step  AS ENUM ('Cleanser','Toner','Serum','Moisturizer','Sunscreen','Treatment','Mask'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE order_status  AS ENUM ('pending','confirmed','processing','shipped','delivered','cancelled');    EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE review_status AS ENUM ('pending','approved','rejected');   EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE discount_type AS ENUM ('percentage','fixed');              EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ── STEP 2: CREATE TABLES (minimal — just PK) ────────────────
CREATE TABLE IF NOT EXISTS public.profiles      (id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.products      (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.promo_codes   (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.orders        (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.order_items   (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.commissions   (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.cart_items    (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.announcements (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.site_config   (key TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.reviews       (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.pending_orders(id UUID DEFAULT gen_random_uuid() PRIMARY KEY);

-- ── STEP 3: ADD ALL COLUMNS (safe — skips existing) ──────────

-- profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name  TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role       TEXT NOT NULL DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name           TEXT NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug           TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description    TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price          NUMERIC(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_pct   NUMERIC(5,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS active         BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ingredients    JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS skin_concerns  JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS regimen_step   TEXT DEFAULT 'Serum';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_grams   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS volume_ml      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url      TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer_ends_at  TIMESTAMPTZ;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

-- promo_codes
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS code             TEXT;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS influencer_name  TEXT;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS discount_type    TEXT NOT NULL DEFAULT 'percentage';
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS discount_value   NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS commission_pct   NUMERIC(5,2)  NOT NULL DEFAULT 20.00;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS active           BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS expires_at       TIMESTAMPTZ;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS usage_limit      INTEGER;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS used_count       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS total_revenue    NUMERIC(12,2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS total_commission NUMERIC(12,2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT NOW();

-- orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number           TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id                UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status                 TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount           NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount        NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code_id          UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code_used        TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address       JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method         TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id             TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shiprocket_order_id    TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_url           TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at             TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at             TIMESTAMPTZ DEFAULT NOW();

-- order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS order_id    UUID REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS quantity    INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS unit_price  NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT NOW();

-- commissions
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS promo_code_id     UUID REFERENCES public.promo_codes(id) ON DELETE CASCADE;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS order_id           UUID REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS influencer_name    TEXT NOT NULL DEFAULT '';
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS order_amount       NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS commission_pct     NUMERIC(5,2)  NOT NULL DEFAULT 0;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS commission_amount  NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS paid               BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS paid_at            TIMESTAMPTZ;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS created_at         TIMESTAMPTZ DEFAULT NOW();

-- cart_items
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS quantity   INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS added_at   TIMESTAMPTZ DEFAULT NOW();

-- announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS text       TEXT NOT NULL DEFAULT '';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS active     BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- site_config
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS value      JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS product_id    UUID REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating        INTEGER NOT NULL DEFAULT 5;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS review_text   TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS status        TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ DEFAULT NOW();

-- pending_orders
ALTER TABLE public.pending_orders ADD COLUMN IF NOT EXISTS transaction_id   TEXT;
ALTER TABLE public.pending_orders ADD COLUMN IF NOT EXISTS user_id          UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.pending_orders ADD COLUMN IF NOT EXISTS cart_items       TEXT NOT NULL DEFAULT '';
ALTER TABLE public.pending_orders ADD COLUMN IF NOT EXISTS shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.pending_orders ADD COLUMN IF NOT EXISTS amount           NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.pending_orders ADD COLUMN IF NOT EXISTS promo_code       TEXT;
ALTER TABLE public.pending_orders ADD COLUMN IF NOT EXISTS discount_amount  NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.pending_orders ADD COLUMN IF NOT EXISTS status           TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.pending_orders ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ DEFAULT NOW();

-- ── STEP 4: INDEXES ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_active      ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active   ON public.promo_codes(active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_promo         ON public.orders(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_commissions_promo    ON public.commissions(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_commissions_paid     ON public.commissions(paid);

-- ── STEP 5: DEFAULT DATA ─────────────────────────────────────
INSERT INTO public.site_config (key, value) VALUES
  ('trusted_customers_count', '5000'::jsonb),
  ('marquee_enabled',         'true'::jsonb),
  ('whatsapp_number',         '"917000000000"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ── STEP 6: FUNCTIONS ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.decrement_stock(product_id UUID, qty INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.products SET stock_quantity = GREATEST(0, stock_quantity - qty), updated_at = NOW() WHERE id = product_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_commission(code_id UUID, amount NUMERIC)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.promo_codes SET total_commission = total_commission + amount, updated_at = NOW() WHERE id = code_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_promo_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.promo_code_id IS NOT NULL THEN
    UPDATE public.promo_codes SET used_count = used_count + 1, total_revenue = total_revenue + NEW.total_amount, updated_at = NOW() WHERE id = NEW.promo_code_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_promo_stats();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- ── STEP 7: RLS ──────────────────────────────────────────────
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;

-- ── STEP 8: POLICIES (drop all first) ────────────────────────
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "products_select"     ON public.products       FOR SELECT USING (true);
CREATE POLICY "products_admin"      ON public.products       FOR ALL    USING (public.is_admin());
CREATE POLICY "orders_select"       ON public.orders         FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_insert"       ON public.orders         FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_admin"        ON public.orders         FOR ALL    USING (public.is_admin());
CREATE POLICY "order_items_select"  ON public.order_items    FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())));
CREATE POLICY "order_items_insert"  ON public.order_items    FOR INSERT WITH CHECK (true);
CREATE POLICY "promo_select"        ON public.promo_codes    FOR SELECT USING (active = true OR public.is_admin());
CREATE POLICY "promo_admin"         ON public.promo_codes    FOR ALL    USING (public.is_admin());
CREATE POLICY "commissions_admin"   ON public.commissions    FOR ALL    USING (public.is_admin());
CREATE POLICY "cart_all"            ON public.cart_items     FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "announce_select"     ON public.announcements  FOR SELECT USING (true);
CREATE POLICY "announce_admin"      ON public.announcements  FOR ALL    USING (public.is_admin());
CREATE POLICY "config_select"       ON public.site_config    FOR SELECT USING (true);
CREATE POLICY "config_admin"        ON public.site_config    FOR ALL    USING (public.is_admin());
CREATE POLICY "profiles_all"        ON public.profiles       FOR ALL    USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "reviews_select"      ON public.reviews        FOR SELECT USING (status = 'approved' OR public.is_admin());
CREATE POLICY "reviews_insert"      ON public.reviews        FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_admin"       ON public.reviews        FOR ALL    USING (public.is_admin());
CREATE POLICY "pending_all"         ON public.pending_orders FOR ALL    USING (auth.uid() = user_id);

-- ── STEP 9: REALTIME ─────────────────────────────────────────
-- Enable real-time for storefront live updates (marquee, announcements, products)
-- Run this ONCE in Supabase SQL editor if real-time is not already enabled.
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_config;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
