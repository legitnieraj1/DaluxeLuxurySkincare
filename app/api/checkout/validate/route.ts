import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/auth';

const rateLimitMap = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    
    const now = Date.now();
    const lastRequest = rateLimitMap.get(user.id);
    if (lastRequest && now - lastRequest < 5000) {
      return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
    }
    rateLimitMap.set(user.id, now);

    const { cart_items } = await request.json();
    
    if (!cart_items || cart_items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const productIds = cart_items.map((item: any) => item.product_id);
    
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, stock_quantity')
      .in('id', productIds);

    if (error) throw error;

    for (const item of cart_items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product || product.stock_quantity < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for product ID: ${item.product_id}`
        }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Stock validated.' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
