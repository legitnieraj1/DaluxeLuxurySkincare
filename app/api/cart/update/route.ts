import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const { product_id, quantity } = await request.json();

    if (!product_id || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'Invalid product_id or quantity' }, { status: 400 });
    }

    // Verify stock
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('stock_quantity')
      .eq('id', product_id)
      .single();

    if (!product || quantity > product.stock_quantity) {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', product_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Cart updated' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
