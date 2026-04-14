import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    // Shiprocket sends webhook data containing tracking updates
    // Make sure you have configured a Webhook Token for security in Shiprocket Dashboard
    const token = request.headers.get('x-api-key');

    if (token !== process.env.SHIPROCKET_WEBHOOK_TOKEN && process.env.NODE_ENV === 'production') {
       // Optional: Security check to ensure it's actually Shiprocket
       // return NextResponse.json({ error: 'Unauthorized payload' }, { status: 401 });
    }

    const payload = await request.json();

    // Typical Shiprocket payload for AWB update has awb, current_status, order_id, etc.
    const { awb, current_status, order_id } = payload;

    if (!awb || !current_status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Map Shiprocket status strings to our internal shipment_status formats
    // e.g. "PICKED UP" -> "shipped", "DELIVERED" -> "delivered", etc.
    let mappedStatus = 'pending';
    const rawStatus = current_status.toUpperCase();
    
    if (rawStatus.includes('DELIVERED')) mappedStatus = 'delivered';
    else if (rawStatus.includes('OUT FOR DELIVERY')) mappedStatus = 'out_for_delivery';
    else if (rawStatus.includes('SHIPPED') || rawStatus.includes('PICKED UP')) mappedStatus = 'shipped';
    else if (rawStatus.includes('CANCELLED')) mappedStatus = 'cancelled';
    else mappedStatus = 'processing';

    // Update the local database via AWB match (which we stored as shipment_id initially)
    // Or we match by order_id if it maps to our Daluxe `id` or `order_number`
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ shipment_status: mappedStatus })
      .eq('shipment_id', awb); // Assuming we store the AWB as shipment_id

    if (error) {
       console.error('Failed to update DB for Shiprocket update:', error);
       throw error;
    }

    return NextResponse.json({ success: true, message: 'Status synced' });

  } catch (error: any) {
    console.error('Shiprocket webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
