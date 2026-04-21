import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createShiprocketOrder } from './shiprocket';

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
  const action = req.query.action || 'validate';

  // ─── VALIDATE STOCK ───
  if (action === 'validate') {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const { cart_items } = req.body;
      if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
        return res.status(400).json({ success: false, error: 'Cart is empty' });
      }

      for (const item of cart_items) {
        if (!item.product_id || typeof item.quantity !== 'number' || item.quantity < 1) {
          return res.status(400).json({ success: false, error: 'Invalid cart item format' });
        }
      }

      const { data: allProducts, error } = await supabaseAdmin.from('products').select('id, name, stock_quantity, price').eq('active', true);
      if (error) return res.status(500).json({ success: false, error: 'Database error while checking stock' });

      for (const item of cart_items) {
        let product = allProducts?.find((p: any) => p.id === item.product_id);
        if (!product && item.name) {
          const itemNameUpper = item.name.toUpperCase();
          product = allProducts?.find((p: any) => p.name?.toUpperCase().includes(itemNameUpper) || itemNameUpper.includes(p.name?.toUpperCase()));
        }
        if (!product) continue; // Skip hardcoded products not in DB

        if (product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity < item.quantity) {
          return res.status(400).json({ success: false, error: `"${product.name}" is out of stock (only ${product.stock_quantity} available)` });
        }
      }
      return res.status(200).json({ success: true, message: 'Stock validated' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
  }

  // ─── COD ORDER CREATION ───
  if (action === 'cod') {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const { orderPayload, cartItems } = req.body;
      if (!orderPayload || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid order data' });
      }

      const orderNumber = `DLX-COD-${Date.now().toString(36).toUpperCase()}`;

      const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
        user_id: user.id, order_number: orderNumber, total_amount: orderPayload.total_amount,
        payment_gateway: 'cod', status: 'confirmed', shipment_status: 'pending',
        shipping_address: orderPayload.shipping_address,
      }).select().single();

      if (orderError) return res.status(500).json({ success: false, error: 'Failed to create order' });

      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id, product_id: item.product_id, name: item.name || item.product_id, quantity: item.quantity, price: item.price,
      }));

      await supabaseAdmin.from('order_items').insert(orderItems);
      
      for (const item of cartItems) {
        await supabaseAdmin.rpc('decrement_stock', { p_product_id: item.product_id, p_quantity: item.quantity });
      }

      // Clear user's cart after successful order
      await supabaseAdmin.from('cart_items').delete().eq('user_id', user.id);

      // Trigger Shiprocket order creation (non-blocking)
      const addr = orderPayload.shipping_address || {};
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
        billing_email: user.email || '',
        shipping_is_billing: true,
        payment_method: 'COD',
        sub_total: orderPayload.total_amount,
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
          console.log('[Checkout/COD] Shiprocket synced for', orderNumber);
        } else {
          console.warn('[Checkout/COD] Shiprocket failed for', orderNumber, srResult.error);
        }
      }).catch(e => console.error('[Checkout/COD] Shiprocket error:', e));

      return res.status(200).json({ success: true, order: { order_number: order.order_number } });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
  }

  // ─── SHIPPING CALCULATOR ───
  if (action === 'shipping') {
    const { pincode, weight, payment } = req.query;
    if (!pincode || pincode.toString().length < 6) return res.status(400).json({ success: false, error: 'Valid 6-digit pincode is required' });

    try {
      const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
      const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
      const SHIPROCKET_BASE_URL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';
      const PICKUP_POSTCODE = process.env.SHIPROCKET_PICKUP_POSTCODE || '560001';

      if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
        return res.status(200).json({ success: true, serviceable: true, rate: 99, estimatedDays: '3-5' });
      }

      const authRes = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD })
      });
      const authData = await authRes.json();
      const token = authData.token;
      if (!token) throw new Error('Shiprocket Auth Failed');

      const codParam = payment === 'cod' ? 1 : 0;
      const rateRes = await fetch(
        `${SHIPROCKET_BASE_URL}/courier/serviceability/?pickup_postcode=${PICKUP_POSTCODE}&delivery_postcode=${pincode}&weight=${weight || 0.5}&cod=${codParam}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const rateData = await rateRes.json();

      if (rateData.status === 200 && rateData.data && rateData.data.available_courier_companies?.length > 0) {
        const sorted = rateData.data.available_courier_companies.sort((a: any, b: any) => a.rate - b.rate);
        return res.status(200).json({ success: true, serviceable: true, rate: Math.ceil(sorted[0].rate), estimatedDays: sorted[0].etd });
      } else {
        return res.status(200).json({ success: true, serviceable: false, rate: 0 });
      }
    } catch (e: any) {
      console.error('[shipping]', e);
      return res.status(200).json({ success: true, serviceable: true, rate: 99, estimatedDays: '3-5' });
    }
  }

  return res.status(400).json({ success: false, error: 'Invalid checkout action' });
}
