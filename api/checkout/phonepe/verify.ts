import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_ENV = process.env.PHONEPE_ENV || 'UAT';

const PHONEPE_HOST = PHONEPE_ENV === 'PROD'
  ? 'https://api.phonepe.com/apis/hermes'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    let transactionId = '';
    let isSuccess = false;

    // PhonePe S2S callback sends base64 in `response` field
    // Frontend verify sends `transactionId` directly
    const body = req.body;

    if (body?.transactionId) {
      transactionId = body.transactionId;
    } else if (body?.response) {
      // Decode PhonePe webhook base64 payload
      const decoded = Buffer.from(body.response, 'base64').toString('utf8');
      const payload = JSON.parse(decoded);
      transactionId = payload?.data?.merchantTransactionId || '';
      if (payload.code === 'PAYMENT_SUCCESS') isSuccess = true;
    }

    if (!transactionId) {
      return res.status(400).json({ success: false, error: 'Missing transaction ID' });
    }

    console.log('[phonepe/verify] Verifying transaction:', transactionId);

    // If not already determined via webhook, check with PhonePe API
    if (!isSuccess) {
      const endpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}`;
      const stringToHash = endpoint + PHONEPE_SALT_KEY;
      const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const checksum = sha256Hash + '###' + PHONEPE_SALT_INDEX;

      const statusRes = await fetch(`${PHONEPE_HOST}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
        },
      });
      const statusData = await statusRes.json();

      console.log('[phonepe/verify] Status check:', JSON.stringify(statusData));

      if (statusData.success && statusData.code === 'PAYMENT_SUCCESS') {
        isSuccess = true;
      }
    }

    // Idempotency: check if order already created
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('transaction_id', transactionId)
      .single();

    if (existingOrder) {
      console.log('[phonepe/verify] Order already exists:', existingOrder.id);
      return res.status(200).json({ success: true, message: 'Order already processed', order: existingOrder });
    }

    if (!isSuccess) {
      return res.status(200).json({ success: false, error: 'Payment not successful or still pending' });
    }

    // Fetch pending order data
    const { data: pending } = await supabaseAdmin
      .from('pending_orders')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (pending) {
      const cartItems = JSON.parse(pending.cart_items);
      const shippingAddress = pending.shipping_address ? JSON.parse(pending.shipping_address) : {};
      const orderNumber = `DLX-${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: pending.user_id,
          order_number: orderNumber,
          total_amount: pending.amount,
          transaction_id: transactionId,
          payment_gateway: 'phonepe',
          status: 'confirmed',
          shipment_status: 'pending',
          shipping_address: shippingAddress,
        })
        .select()
        .single();

      if (orderError) {
        console.error('[phonepe/verify] Order creation failed:', orderError);
        return res.status(500).json({ success: false, error: 'Failed to create order' });
      }

      // Create order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      await supabaseAdmin.from('order_items').insert(orderItems);

      // Update pending order status
      await supabaseAdmin
        .from('pending_orders')
        .update({ status: 'completed' })
        .eq('transaction_id', transactionId);

      // Decrement stock
      for (const item of cartItems) {
        await supabaseAdmin.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
      }

      console.log('[phonepe/verify] Order created:', order.order_number);
      return res.status(200).json({ success: true, message: 'Payment verified, order created', order });
    }

    return res.status(200).json({ success: true, message: 'Payment verified (no pending order data found)' });

  } catch (error: any) {
    console.error('[phonepe/verify] Fatal error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
