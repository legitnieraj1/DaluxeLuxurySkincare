import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = (process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external').replace(/\/$/, '');

async function getToken() {
  const email = (process.env.SHIPROCKET_EMAIL || '').replace(/^['"]|['"]$/g, '').trim();
  const password = (process.env.SHIPROCKET_PASSWORD || '').replace(/^['"]|['"]$/g, '').trim();
  
  console.log('[SRTest] Authenticating with email:', email);
  
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await res.json();
  console.log('[SRTest] Auth response status:', res.status, 'token present:', !!data.token);
  
  if (!res.ok || !data.token) {
    throw new Error(`Auth failed: ${JSON.stringify(data)}`);
  }
  return data.token as string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'auth';

  try {
    // 1. Test auth
    if (action === 'auth') {
      const token = await getToken();
      return NextResponse.json({ success: true, message: 'Auth OK', token_preview: token.slice(0, 20) + '...' });
    }

    // 2. Test pickup locations
    if (action === 'pickups') {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/settings/company/pickup`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return NextResponse.json({ success: res.ok, status: res.status, data });
    }

    // 3. Test serviceability
    if (action === 'service') {
      const token = await getToken();
      const pincode = searchParams.get('pincode') || '400001';
      const pickup = process.env.SHIPROCKET_PICKUP_POSTCODE || '400017';
      const res = await fetch(
        `${BASE_URL}/courier/serviceability?pickup_postcode=${pickup}&delivery_postcode=${pincode}&weight=0.5&cod=0`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      return NextResponse.json({ success: res.ok, status: res.status, couriersFound: data?.data?.available_courier_companies?.length, cheapest: data?.data?.available_courier_companies?.[0] });
    }

    // 4. Test create order
    if (action === 'create') {
      const token = await getToken();
      const testOrderNumber = `DLX-TEST-${Date.now().toString(36).toUpperCase()}`;
      const payload = {
        order_id: testOrderNumber,
        order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        pickup_location: 'Primary',
        billing_customer_name: 'Test Customer',
        billing_last_name: '',
        billing_address: '102/gkd nagar, Periyanaickenpalayam',
        billing_city: 'Mumbai',
        billing_pincode: '641020',
        billing_state: 'Tamil Nadu',
        billing_country: 'India',
        billing_email: 'test@example.com',
        billing_phone: '9999999999',
        shipping_is_billing: true,
        order_items: [{ name: 'Face Serum', sku: 'face-serum-30ml', units: 1, selling_price: 449, discount: 0, tax: 0, hsn: 0 }],
        payment_method: 'Prepaid',
        sub_total: 449,
        length: 15,
        breadth: 12,
        height: 10,
        weight: 0.5,
      };

      console.log('[SRTest] Creating test order:', testOrderNumber);
      const res = await fetch(`${BASE_URL}/orders/create/adhoc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return NextResponse.json({ success: res.ok, status: res.status, data });
    }

    return NextResponse.json({ error: 'Unknown action. Use: auth | pickups | service | create' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
