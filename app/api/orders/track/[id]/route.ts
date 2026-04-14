import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json({ error: 'Order Tracking ID required' }, { status: 400 });
    }

    // Verify order belongs to user
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, shipment_id, tracking_url, shipment_status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // We can also fetch live details from Shiprocket using SHIPROCKET_EMAIL/PASSWORD 
    // to generate a token and hit their track endpoint dynamically, but returning DB state is faster
    // as it's kept in sync via Webhook.

    return NextResponse.json({ 
      success: true, 
      tracking: {
         awb: order.shipment_id,
         url: order.tracking_url,
         status: order.shipment_status 
      } 
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
