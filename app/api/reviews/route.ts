import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { product_id, order_id, rating, comment } = await request.json();

    if (!product_id || rating === undefined) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'Review already exists for this product.' }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id,
        order_id: order_id || null,
        rating,
        comment: comment || '',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ review: data });
  } catch (error: any) {
     if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
