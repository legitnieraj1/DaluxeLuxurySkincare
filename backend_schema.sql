-- Run this in your Supabase SQL Editor

-- 1. Create Promocodes Table
CREATE TABLE IF NOT EXISTS public.promocodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL CHECK (value > 0),
  expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Persistent Cart Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 3. Modify Orders Table for PhonePe & Shiprocket
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS transaction_id TEXT UNIQUE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'phonepe';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipment_status TEXT DEFAULT 'pending';

-- Enable RLS
ALTER TABLE public.promocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Promocodes Policies (Admin only for write, public for read check)
CREATE POLICY "Public read active promocodes" ON public.promocodes FOR SELECT USING (active = true AND expiry > NOW());
CREATE POLICY "Admin manage promocodes" ON public.promocodes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Cart Items Policies (Users manage their own)
CREATE POLICY "Users can manage their own cart" ON public.cart_items FOR ALL USING (user_id = auth.uid());
