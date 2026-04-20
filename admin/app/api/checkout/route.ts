import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function getUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'shipping') {
    const pincode = searchParams.get('pincode');
    const weight = searchParams.get('weight') || '0.5';
    const payment = searchParams.get('payment');

    if (!pincode || pincode.length < 6) {
      return NextResponse.json({ success: false, error: 'Valid 6-digit pincode is required' }, { status: 400 });
    }

    try {
      const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
      const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
      const SHIPROCKET_BASE_URL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';
      const PICKUP_POSTCODE = process.env.SHIPROCKET_PICKUP_POSTCODE || '560001';

      if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
        return NextResponse.json({ success: true, serviceable: true, rate: 99, estimatedDays: '3-5' });
      }

      const authRes = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD })
      });
      const authData = await authRes.json();
      const token = authData.token;
      if (!token) throw new Error('Shiprocket Auth Failed');

      const codParam = payment === 'cod' ? 1 : 0;
      const rateRes = await fetch(
        `${SHIPROCKET_BASE_URL}/courier/serviceability/?pickup_postcode=${PICKUP_POSTCODE}&delivery_postcode=${pincode}&weight=${weight}&cod=${codParam}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const rateData = await rateRes.json();

      if (rateData.status === 200 && rateData.data && rateData.data.available_courier_companies?.length > 0) {
        const sorted = rateData.data.available_courier_companies.sort((a: any, b: any) => a.rate - b.rate);
        return NextResponse.json({ success: true, serviceable: true, rate: Math.ceil(sorted[0].rate), estimatedDays: sorted[0].etd });
      } else {
        return NextResponse.json({ success: true, serviceable: false, rate: 0 });
      }
    } catch (e: any) {
      console.error('[shipping]', e);
      return NextResponse.json({ success: true, serviceable: true, rate: 99, estimatedDays: '3-5' });
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  // user may be null for guests — individual actions decide if auth is required
  const user = await getUser(request);

  if (action === 'validate') {
    // No auth required — guests need stock validation too
    try {
      const { cart_items } = await request.json();
      if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
        return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
      }

      const { data: allProducts, error } = await supabaseAdmin.from('products').select('id, name, stock_quantity').eq('active', true);
      if (error) return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });

      for (const item of cart_items) {
        const product = allProducts?.find((p: any) => p.id === item.product_id);
        if (!product) continue;
        if (product.stock_quantity !== null && product.stock_quantity < item.quantity) {
          return NextResponse.json({ success: false, error: `"${product.name}" is out of stock (only ${product.stock_quantity} available)` }, { status: 400 });
        }
      }
      return NextResponse.json({ success: true, message: 'Stock validated' });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  if (action === 'cod') {
    // COD allows guests; user may be null
    try {
      const { orderPayload, cartItems } = await request.json();
      const orderNumber = `DLX-COD-${Date.now().toString(36).toUpperCase()}`;

      const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
        user_id: user?.id ?? null,
        order_number: orderNumber,
        total_amount: orderPayload.total_amount,
        payment_method: 'cod',
        status: 'confirmed',
        shipping_address: orderPayload.shipping_address,
      }).select().single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      await supabaseAdmin.from('order_items').insert(orderItems);
      
      for (const item of cartItems) {
        await supabaseAdmin.rpc('decrement_stock', { product_id: item.product_id, qty: item.quantity });
      }

      if (user?.id) {
        await supabaseAdmin.from('cart_items').delete().eq('user_id', user.id);
      }

      return NextResponse.json({ success: true, order: { order_number: order.order_number } });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
