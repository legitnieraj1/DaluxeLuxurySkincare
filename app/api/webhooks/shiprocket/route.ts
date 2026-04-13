import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { order_id, current_status, awb } = payload;

    console.log(`[SHIPROCKET WEBHOOK] Order ID: ${order_id} | Status: ${current_status} | Tracking: ${awb}`);

    if (!order_id || !current_status) {
      return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      'PENDING': 'pending',
      'SHIPPED': 'shipped',
      'OUT FOR DELIVERY': 'out_for_delivery',
      'DELIVERED': 'delivered',
      'CANCELED': 'canceled'
    };

    const internalStatus = statusMap[current_status.toUpperCase()] || 'pending';

    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: internalStatus,
        tracking_id: awb,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id);

    if (error) throw error;

    return NextResponse.json({ success: true, updated_status: internalStatus });
  } catch (error: any) {
    console.error(`[SHIPROCKET WEBHOOK EXCEPTION]`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
