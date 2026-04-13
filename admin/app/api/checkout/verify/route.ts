import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase/client';
import { ShiprocketService } from '@/lib/shiprocket';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      orderPayload, 
      cartItems 
    } = body;

    // 1. Verify Payment
    const isValid = verifyRazorpaySignature(
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Insert Order to Supabase
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: `ORD-${Date.now()}`,
        user_id: orderPayload.user_id || null,
        status: 'confirmed',
        total_amount: orderPayload.total_amount,
        shipping_address: orderPayload.shipping_address,
        payment_id: razorpay_payment_id
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Failed to create order', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // 3. Decrement Product Stock & Create Order Items
    for (const item of cartItems) {
      await supabaseAdmin.from('order_items').insert({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      });

      // Fetch current stock
      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('stock_level')
        .eq('id', item.product_id)
        .single();
      
      if (prod) {
        await supabaseAdmin
          .from('products')
          .update({ stock_level: Math.max(0, prod.stock_level - item.quantity) })
          .eq('id', item.product_id);
      }
    }

    // 4. Trigger Shiprocket Ad-hoc Order
    try {
      const shiprocketPayload = {
        order_id: orderData.order_number,
        order_date: new Date().toISOString(),
        pickup_location: "Primary",
        billing_customer_name: orderPayload.shipping_address.name,
        billing_last_name: "",
        billing_address: orderPayload.shipping_address.address_line1,
        billing_address_2: orderPayload.shipping_address.address_line2 || "",
        billing_city: orderPayload.shipping_address.city,
        billing_state: orderPayload.shipping_address.state,
        billing_country: "India",
        billing_pincode: orderPayload.shipping_address.pincode,
        billing_email: orderPayload.email,
        billing_phone: orderPayload.shipping_address.phone,
        shipping_is_billing: true,
        order_items: cartItems.map((item: any) => ({
          name: item.name,
          sku: item.slug || "SKU-DEF",
          units: item.quantity,
          selling_price: item.price,
          discount: 0,
          tax: 0,
          hsn: "33049910"
        })),
        payment_method: "Prepaid",
        sub_total: orderPayload.total_amount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: orderPayload.total_weight_kg || 0.5
      };

      const shiprocketRes = await ShiprocketService.createOrder(shiprocketPayload);
      
      if (shiprocketRes && shiprocketRes.order_id) {
        await supabaseAdmin
          .from('orders')
          .update({ 
            shiprocket_order_id: shiprocketRes.order_id.toString(),
            shiprocket_shipment_id: shiprocketRes.shipment_id.toString() 
          })
          .eq('id', orderData.id);
      }
    } catch (shiprocketErr) {
      console.error('Shiprocket creation failed, but order was saved', shiprocketErr);
      // We don't throw - the order is successful, just shipping failed to sync automatically
    }

    return NextResponse.json({ success: true, order: orderData });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
