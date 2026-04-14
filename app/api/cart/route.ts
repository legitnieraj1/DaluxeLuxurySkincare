import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    // Fetch cart items with joined product details
    const { data: cartItems, error } = await supabaseAdmin
      .from('cart_items')
      .select(`
        id,
        quantity,
        added_at,
        products (
          id,
          name,
          price,
          sale_price,
          images,
          stock_quantity
        )
      `)
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) throw error;

    // Format response to be client-friendly
    const formattedCart = cartItems.map((item: any) => ({
      cart_item_id: item.id,
      quantity: item.quantity,
      product: item.products
    }));

    return NextResponse.json({ success: true, cart: formattedCart });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
