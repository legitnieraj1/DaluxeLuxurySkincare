import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { code, cart_total } = await request.json();

    if (!code || typeof cart_total !== 'number' || cart_total <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid promo code or cart total' }, { status: 400 });
    }

    // Fetch from correct table with correct field names
    const { data: promo, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('active', true)
      .single();

    if (error || !promo) {
      return NextResponse.json({ success: false, error: 'Invalid promo code' }, { status: 404 });
    }

    // Check expiry (field is expires_at, not expiry)
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Promo code has expired' }, { status: 400 });
    }

    // Check usage limit
    if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
      return NextResponse.json({ success: false, error: 'Usage limit reached' }, { status: 400 });
    }

    // Calculate discount (field is discount_value, not value)
    let discount = 0;
    if (promo.discount_type === 'percentage') {
      discount = Math.round((cart_total * promo.discount_value) / 100);
    } else {
      discount = promo.discount_value;
    }
    discount = Math.min(discount, cart_total);

    return NextResponse.json({
      success: true,
      code: promo.code,
      influencer_name: promo.influencer_name,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      discount_amount: discount,
      new_total: cart_total - discount,
    });

  } catch (error: any) {
    console.error('[/api/promocode/apply]', error?.message);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
