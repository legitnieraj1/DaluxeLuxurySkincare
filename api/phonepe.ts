import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createShiprocketOrder } from './shiprocket';

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

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
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
  cachedToken = data.access_token;
  tokenExpiresAt = (data.expires_at || Date.now() + 14 * 60 * 1000) - 60000;
  return cachedToken!;
}

async function getUser(req: VercelRequest) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action || 'verify';

  // ─── INITIATE ───
  if (action === 'initiate') {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });

      const { amount, cart_items, shipping_address } = req.body;
      if (!amount || amount <= 0) return res.status(400).json({ success: false, error: 'Invalid payment amount' });

      const merchantOrderId = `DALUXE-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      if (cart_items && cart_items.length > 0) {
        await supabaseAdmin.from('pending_orders').upsert({
          transaction_id: merchantOrderId,
          user_id: user.id,
          cart_items: JSON.stringify(cart_items),
          shipping_address: shipping_address ? JSON.stringify(shipping_address) : null,
          amount,
          status: 'initiated',
          created_at: new Date().toISOString(),
        });
      }

      const accessToken = await getAccessToken();
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app').replace(/\/$/, '');

      const paymentPayload = {
        merchantOrderId,
        amount: Math.round(amount * 100),
        expireAfter: 1200,
        paymentFlow: {
          type: 'PG_CHECKOUT',
          merchantUrls: {
            redirectUrl: `${appUrl}/api/phonepe?action=callback&orderId=${merchantOrderId}`,
          },
        },
        metaInfo: { udf1: user.id, udf2: user.email || '' },
      };

      const phonePeRes = await fetch(`${PHONEPE_HOST}/checkout/v2/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `O-Bearer ${accessToken}` },
        body: JSON.stringify(paymentPayload),
      });

      const phonePeData = await phonePeRes.json();

      if (phonePeRes.ok && phonePeData.redirectUrl) {
        return res.status(200).json({ success: true, data: { orderId: merchantOrderId, redirectUrl: phonePeData.redirectUrl } });
      }

      return res.status(400).json({ success: false, error: phonePeData.message || 'Failed to create payment session' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
  }


  // ─── CALLBACK (S2S or User Redirect) ───
  if (action === 'callback') {
    try {
      const orderId = (req.query.orderId as string) || req.body?.merchantOrderId;
      if (!orderId) return res.status(400).json({ success: false, error: 'Missing orderId' });

      const { data: existingOrder } = await supabaseAdmin.from('orders').select('id, order_number').eq('transaction_id', orderId).single();
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app').replace(/\/$/, '');
      
      if (existingOrder) {
        return res.redirect(302, `${appUrl}/home#order-success`);
      }

      const accessToken = await getAccessToken();
      const statusRes = await fetch(`${PHONEPE_HOST}/checkout/v2/order/${orderId}/status?details=true`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `O-Bearer ${accessToken}` },
      });
      const statusData = await statusRes.json();
      const state = statusData.state || statusData.orderState || statusData.data?.state || statusData.data?.orderState;

      if (state === 'COMPLETED') {
        const { data: pending } = await supabaseAdmin.from('pending_orders').select('*').eq('transaction_id', orderId).single();
        if (pending) {
          const cartItems = JSON.parse(pending.cart_items);
          const shippingAddress = pending.shipping_address ? JSON.parse(pending.shipping_address) : {};
          const orderNumber = `DLX-${Date.now().toString(36).toUpperCase()}`;

          const { data: order } = await supabaseAdmin.from('orders').insert({
            user_id: pending.user_id, order_number: orderNumber, total_amount: pending.amount,
            transaction_id: orderId, payment_gateway: 'phonepe', status: 'confirmed',
            shipment_status: 'pending', shipping_address: shippingAddress,
          }).select().single();

          if (order) {
            const orderItems = cartItems.map((item: any) => ({ order_id: order.id, product_id: item.product_id, quantity: item.quantity, price: item.price }));
            await supabaseAdmin.from('order_items').insert(orderItems);
            await supabaseAdmin.from('pending_orders').update({ status: 'completed' }).eq('transaction_id', orderId);
            for (const item of cartItems) {
              await supabaseAdmin.rpc('decrement_stock', { p_product_id: item.product_id, p_quantity: item.quantity });
            }

            // Clear user's cart
            await supabaseAdmin.from('cart_items').delete().eq('user_id', pending.user_id);

            // Trigger Shiprocket (non-blocking)
            const addr = shippingAddress || {};
            createShiprocketOrder({
              order_id: order.id,
              order_number: orderNumber,
              order_date: new Date().toISOString().split('T')[0],
              billing_customer_name: addr.name || '',
              billing_phone: addr.phone || '',
              billing_address: addr.address_line1 || '',
              billing_city: addr.city || '',
              billing_state: addr.state || '',
              billing_pincode: addr.pincode || '',
              billing_email: '',
              shipping_is_billing: true,
              payment_method: 'Prepaid',
              sub_total: pending.amount,
              items: cartItems.map((item: any) => ({
                name: item.name || `Product ${item.product_id}`,
                sku: item.product_id,
                units: item.quantity,
                selling_price: item.price,
                weight: '0.5',
              })),
            }).then(async (srResult) => {
              if (srResult.success) {
                await supabaseAdmin.from('orders').update({
                  shipment_id: srResult.shipment_id || null,
                  awb_code: srResult.awb_code || null,
                  tracking_url: srResult.tracking_url || null,
                }).eq('id', order.id);
                console.log('[PhonePe/Callback] Shiprocket synced for', orderNumber);
              } else {
                console.warn('[PhonePe/Callback] Shiprocket failed for', orderNumber, srResult.error);
              }
            }).catch(e => console.error('[PhonePe/Callback] Shiprocket error:', e));
          }
        }
        return res.redirect(302, `${appUrl}/home#order-success`);
      }

      if (state === 'FAILED' || state === 'CANCELLED') return res.redirect(302, `${appUrl}/home#payment-failed`);
      return res.redirect(302, `${appUrl}/home#payment-pending`);
    } catch (error: any) {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app').replace(/\/$/, '');
      return res.redirect(302, `${appUrl}/home#payment-error`);
    }
  }

  // ─── VERIFY (Frontend Polling) ───
  if (action === 'verify') {
    try {
      const orderId = (req.query.orderId as string) || req.body?.orderId;
      if (!orderId) return res.status(400).json({ success: false, error: 'Missing orderId' });

      const { data: existingOrder } = await supabaseAdmin.from('orders').select('id, order_number').eq('transaction_id', orderId).single();
      if (existingOrder) return res.status(200).json({ success: true, message: 'Order already processed', order: existingOrder });

      const accessToken = await getAccessToken();
      const statusRes = await fetch(`${PHONEPE_HOST}/checkout/v2/order/${orderId}/status?details=true&errorContext=true`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `O-Bearer ${accessToken}` },
      });
      const statusData = await statusRes.json();
      const state = statusData.state || statusData.orderState || statusData.data?.state || statusData.data?.orderState;

      if (state === 'COMPLETED') {
        // Payment confirmed — create order if not already created (handles race with callback)
        const { data: pending } = await supabaseAdmin.from('pending_orders').select('*').eq('transaction_id', orderId).single();
        if (pending && pending.status !== 'completed') {
          const cartItems = JSON.parse(pending.cart_items);
          const shippingAddress = pending.shipping_address ? JSON.parse(pending.shipping_address) : {};
          const orderNumber = `DLX-${Date.now().toString(36).toUpperCase()}`;

          const { data: order } = await supabaseAdmin.from('orders').insert({
            user_id: pending.user_id, order_number: orderNumber, total_amount: pending.amount,
            transaction_id: orderId, payment_gateway: 'phonepe', status: 'confirmed',
            shipment_status: 'pending', shipping_address: shippingAddress,
          }).select().single();

          if (order) {
            const orderItems = cartItems.map((item: any) => ({ order_id: order.id, product_id: item.product_id, quantity: item.quantity, price: item.price }));
            await supabaseAdmin.from('order_items').insert(orderItems);
            await supabaseAdmin.from('pending_orders').update({ status: 'completed' }).eq('transaction_id', orderId);
            for (const item of cartItems) {
              await supabaseAdmin.rpc('decrement_stock', { p_product_id: item.product_id, p_quantity: item.quantity });
            }

            // Clear user's cart
            await supabaseAdmin.from('cart_items').delete().eq('user_id', pending.user_id);

            // Trigger Shiprocket (non-blocking)
            const addr = shippingAddress || {};
            createShiprocketOrder({
              order_id: order.id,
              order_number: orderNumber,
              order_date: new Date().toISOString().split('T')[0],
              billing_customer_name: addr.name || '',
              billing_phone: addr.phone || '',
              billing_address: addr.address_line1 || '',
              billing_city: addr.city || '',
              billing_state: addr.state || '',
              billing_pincode: addr.pincode || '',
              billing_email: '',
              shipping_is_billing: true,
              payment_method: 'Prepaid',
              sub_total: pending.amount,
              items: cartItems.map((item: any) => ({
                name: item.name || `Product ${item.product_id}`,
                sku: item.product_id,
                units: item.quantity,
                selling_price: item.price,
                weight: '0.5',
              })),
            }).then(async (srResult) => {
              if (srResult.success) {
                await supabaseAdmin.from('orders').update({
                  shipment_id: srResult.shipment_id || null,
                  awb_code: srResult.awb_code || null,
                  tracking_url: srResult.tracking_url || null,
                }).eq('id', order.id);
                console.log('[PhonePe/Verify] Shiprocket synced for', orderNumber);
              } else {
                console.warn('[PhonePe/Verify] Shiprocket failed for', orderNumber, srResult.error);
              }
            }).catch(e => console.error('[PhonePe/Verify] Shiprocket error:', e));

            return res.status(200).json({ success: true, state: 'COMPLETED', order: { order_number: order.order_number } });
          }
        }
        return res.status(200).json({ success: true, state: 'COMPLETED' });
      }
      if (state === 'FAILED') return res.status(200).json({ success: false, state: 'FAILED', error: statusData.errorContext?.description || 'Payment failed' });
      
      return res.status(200).json({ success: false, state: state || 'UNKNOWN', error: 'Payment not completed' });
    } catch (error: any) {
      console.error('[PhonePe/Verify] Error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
  }

  return res.status(400).json({ success: false, error: 'Invalid action' });
}

