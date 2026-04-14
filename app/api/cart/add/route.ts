import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { product_id, quantity = 1 } = await request.json();

    if (!product_id || quantity < 1) {
      return NextResponse.json({ error: 'Invalid product_id or quantity' }, { status: 400 });
    }

    // Check product stock and existence
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('stock_quantity')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if item already exists in cart mapped to this user_id and product_id (handled by unique constraint)
    // We can do an upsert
    const { data: existingItem } = await supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    let newQuantity = quantity;
    if (existingItem) {
      newQuantity = existingItem.quantity + quantity;
    }

    if (newQuantity > product.stock_quantity) {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 });
    }

    const { error: upsertError } = await supabaseAdmin
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id,
        quantity: newQuantity,
      }, { onConflict: 'user_id, product_id' });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, message: 'Added to cart' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
