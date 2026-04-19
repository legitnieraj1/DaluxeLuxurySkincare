import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET() {
  const start = Date.now();
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[/api/products] Supabase error:', error.message);
      throw error;
    }

    console.log(`[/api/products] fetched ${(products || []).length} products in ${Date.now() - start}ms`);

    const formattedProducts = (products || []).map((product) => {
      let stockMessage = 'In stock';
      if (product.stock_quantity <= 0) {
        stockMessage = 'Out of stock';
      } else if (product.stock_quantity <= 5) {
        stockMessage = `Only ${product.stock_quantity} left!`;
      } else if (product.stock_quantity <= 10) {
        stockMessage = `Low stock — ${product.stock_quantity} remaining`;
      }
      return { ...product, stock_message: stockMessage };
    });

    return NextResponse.json({ success: true, products: formattedProducts });
  } catch (error: any) {
    console.error('[/api/products] error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
