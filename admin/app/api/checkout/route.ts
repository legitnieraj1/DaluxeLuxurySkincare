import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { ShiprocketService } from '@/lib/shiprocket';

async function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  // ─── SHIPPING CALCULATOR ───
  if (action === 'shipping') {
    const pincode = searchParams.get('pincode');
    const weight = searchParams.get('weight') || '0.5';
    const payment = searchParams.get('payment');

    if (!pincode || pincode.length < 6) {
      return NextResponse.json({ success: false, error: 'Valid 6-digit pincode is required' }, { status: 400 });
    }

    try {
      const PICKUP_POSTCODE = parseInt(process.env.SHIPROCKET_PICKUP_POSTCODE || '560001');
      const codParam = payment === 'cod' ? 1 : 0;

      const rateData: any = await ShiprocketService.checkServiceability({
        pickup_postcode: PICKUP_POSTCODE,
        delivery_postcode: parseInt(pincode),
        weight: parseFloat(weight),
        cod: codParam,
      });

      if (rateData.status === 200 && rateData.data && rateData.data.available_courier_companies?.length > 0) {
        const sorted = rateData.data.available_courier_companies.sort((a: any, b: any) => a.rate - b.rate);
        return NextResponse.json({ 
          success: true, 
          serviceable: true, 
          rate: Math.ceil(sorted[0].rate), 
          estimatedDays: sorted[0].etd 
        });
      } else {
        return NextResponse.json({ success: true, serviceable: false, rate: 0 });
      }
    } catch (e: any) {
      console.error('[Shipping API Error]:', e);
      // Fallback
      return NextResponse.json({ success: true, serviceable: true, rate: 99, estimatedDays: '3-5' });
    }
  }

  // ─── VALIDATE STOCK ───
  if (action === 'validate') {
    try {
      const user = await getUser(req);
      if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

      const body = await req.json();
      const { cart_items } = body;

      if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
        return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
      }

      const { data: allProducts, error } = await supabaseAdmin.from('products').select('id, name, stock_quantity, price');
      if (error) {
        console.error('[Database Error]:', error);
        return NextResponse.json({ success: false, error: `Database error: ${error.message}` }, { status: 500 });
      }

      for (const item of cart_items) {
        let product = allProducts?.find((p: any) => p.id === item.product_id);
        if (!product && item.name) {
          const itemNameUpper = item.name.toUpperCase();
          product = allProducts?.find((p: any) => p.name?.toUpperCase().includes(itemNameUpper) || itemNameUpper.includes(p.name?.toUpperCase()));
        }
        if (!product) continue;

        if (product.stock_quantity !== null && product.stock_quantity < item.quantity) {
          return NextResponse.json({ success: false, error: `"${product.name}" is out of stock` }, { status: 400 });
        }
      }
      return NextResponse.json({ success: true, message: 'Stock validated' });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  // ─── COD ORDER CREATION ───
  if (action === 'cod') {
    try {
      const user = await getUser(req);
      if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

      const body = await req.json();
      const { orderPayload, cartItems } = body;

      if (!orderPayload || !cartItems || cartItems.length === 0) {
        return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 });
      }

      const orderNumber = `DLX-COD-${Date.now().toString(36).toUpperCase()}`;

      const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
        user_id: user.id, 
        order_number: orderNumber, 
        total_amount: orderPayload.total_amount,
        payment_method: 'cod', 
        status: 'confirmed', 
        shipping_address: orderPayload.shipping_address,
      }).select().single();

      if (orderError) {
        console.error('[Order Creation Error]:', orderError);
        return NextResponse.json({ success: false, error: `Failed to create order: ${orderError.message}` }, { status: 500 });
      }

      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id, 
        product_id: item.product_id, 
        quantity: item.quantity, 
        price: item.price,
      }));

      await supabaseAdmin.from('order_items').insert(orderItems);
      
      for (const item of cartItems) {
        await supabaseAdmin.rpc('decrement_stock', { p_product_id: item.product_id, p_quantity: item.quantity });
      }

      await supabaseAdmin.from('cart_items').delete().eq('user_id', user.id);

      // Trigger Shiprocket
      try {
        const addr = orderPayload.shipping_address || {};
        await ShiprocketService.createOrder({
          order_id: order.id.toString(),
          order_number: orderNumber,
          order_date: new Date().toISOString().split('T')[0],
          billing_customer_name: addr.name || '',
          billing_last_name: '',
          billing_address: addr.address_line1 || '',
          billing_city: addr.city || '',
          billing_pincode: addr.pincode || '',
          billing_state: addr.state || '',
          billing_country: 'India',
          billing_email: user.email || '',
          billing_phone: addr.phone || '',
          shipping_is_billing: 1,
          payment_method: 'COD',
          sub_total: orderPayload.total_amount,
          length: 10, width: 10, height: 10, weight: 0.5,
          order_items: cartItems.map((item: any) => ({
            name: item.name || `Product ${item.product_id}`,
            sku: item.product_id,
            units: item.quantity,
            selling_price: item.price,
            discount: 0, tax: 0, hsn: 0
          })),
        }).then(async (srResult: any) => {
          if (srResult.order_id) {
            await supabaseAdmin.from('orders').update({
              shipment_id: srResult.shipment_id?.toString() || null,
            }).eq('id', order.id);
          }
        });
      } catch (srErr) {
        console.error('[Shiprocket Sync Error]:', srErr);
      }

      return NextResponse.json({ success: true, order: { order_number: order.order_number } });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
