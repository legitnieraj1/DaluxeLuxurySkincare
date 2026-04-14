import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID!;
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET!;
const PHONEPE_CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || '1';
const PHONEPE_ENV = process.env.PHONEPE_ENV || 'UAT';

const PHONEPE_HOST = PHONEPE_ENV === 'PROD'
  ? 'https://api.phonepe.com/apis/pg'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

const PHONEPE_AUTH_HOST = PHONEPE_ENV === 'PROD'
  ? 'https://api.phonepe.com/apis/identity-manager'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${PHONEPE_AUTH_HOST}/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: PHONEPE_CLIENT_ID,
      client_secret: PHONEPE_CLIENT_SECRET,
      client_version: PHONEPE_CLIENT_VERSION,
      grant_type: 'client_credentials',
    }).toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.message || 'Failed to get PhonePe access token');
  }
  return data.access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Accept both GET and POST (PhonePe redirect callback is GET, S2S is POST)
  try {
    const orderId = (req.query.orderId as string) || req.body?.merchantOrderId;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Missing orderId' });
    }

    console.log('[phonepe/verify] Checking status for order:', orderId);

    // Idempotency: check if order already created
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('transaction_id', orderId)
      .single();

    if (existingOrder) {
      console.log('[phonepe/verify] Order already exists:', existingOrder.order_number);
      // Redirect to success page
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app').replace(/\/$/, '');
      return res.redirect(302, `${appUrl}/home#order-success`);
    }

    // Check order status with PhonePe
    const accessToken = await getAccessToken();

    const statusRes = await fetch(
      `${PHONEPE_HOST}/checkout/v2/order/${orderId}/status?details=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${accessToken}`,
        },
      }
    );

    const statusData = await statusRes.json();

    console.log('[phonepe/verify] Status response:', JSON.stringify(statusData));

    const state = statusData.state || statusData.orderState;
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app').replace(/\/$/, '');

    if (state === 'COMPLETED') {
      // Payment successful — create order
      const { data: pending } = await supabaseAdmin
        .from('pending_orders')
        .select('*')
        .eq('transaction_id', orderId)
        .single();

      if (pending) {
        const cartItems = JSON.parse(pending.cart_items);
        const shippingAddress = pending.shipping_address ? JSON.parse(pending.shipping_address) : {};
        const orderNumber = `DLX-${Date.now().toString(36).toUpperCase()}`;

        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert({
            user_id: pending.user_id,
            order_number: orderNumber,
            total_amount: pending.amount,
            transaction_id: orderId,
            payment_gateway: 'phonepe',
            status: 'confirmed',
            shipment_status: 'pending',
            shipping_address: shippingAddress,
          })
          .select()
          .single();

        if (orderError) {
          console.error('[phonepe/verify] Order creation failed:', orderError);
          return res.redirect(302, `${appUrl}/home#payment-error`);
        }

        // Create order items
        const orderItems = cartItems.map((item: any) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        }));

        await supabaseAdmin.from('order_items').insert(orderItems);

        // Update pending order
        await supabaseAdmin
          .from('pending_orders')
          .update({ status: 'completed' })
          .eq('transaction_id', orderId);

        // Decrement stock
        for (const item of cartItems) {
          await supabaseAdmin.rpc('decrement_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });
        }

        console.log('[phonepe/verify] Order created:', orderNumber);
      }

      return res.redirect(302, `${appUrl}/home#order-success`);
    }

    if (state === 'FAILED' || state === 'CANCELLED') {
      console.log('[phonepe/verify] Payment failed/cancelled:', state);
      return res.redirect(302, `${appUrl}/home#payment-failed`);
    }

    // PENDING state
    console.log('[phonepe/verify] Payment pending:', state);
    return res.redirect(302, `${appUrl}/home#payment-pending`);

  } catch (error: any) {
    console.error('[phonepe/verify] Fatal error:', error);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app').replace(/\/$/, '');
    return res.redirect(302, `${appUrl}/home#payment-error`);
  }
}
