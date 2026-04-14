import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function getUser(req: VercelRequest) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { orderPayload, cartItems } = req.body;

    if (!orderPayload || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid order data' });
    }

    const orderNumber = `DLX-COD-${Date.now().toString(36).toUpperCase()}`;

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        total_amount: orderPayload.total_amount,
        payment_gateway: 'cod',
        status: 'confirmed',
        shipment_status: 'pending',
        shipping_address: orderPayload.shipping_address,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[cod] Order creation failed:', orderError);
      return res.status(500).json({ success: false, error: 'Failed to create order' });
    }

    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    await supabaseAdmin.from('order_items').insert(orderItems);

    return res.status(200).json({ success: true, order: { order_number: order.order_number } });

  } catch (error: any) {
    console.error('[cod] Fatal error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
