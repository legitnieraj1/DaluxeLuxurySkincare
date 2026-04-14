import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    if (!product_id) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', product_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
