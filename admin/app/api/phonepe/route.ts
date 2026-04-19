import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID!;
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET!;
const PHONEPE_CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || '1';
const PHONEPE_ENV = process.env.PHONEPE_ENVIRONMENT || 'UAT';

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

  if (action === 'verify') {
    const orderId = searchParams.get('orderId');
    if (!orderId) return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });

    try {
      const { data: existingOrder } = await supabaseAdmin.from('orders').select('id, order_number').eq('transaction_id', orderId).single();
      if (existingOrder) return NextResponse.json({ success: true, message: 'Order already processed', order: existingOrder });

      const accessToken = await getAccessToken();
      const statusRes = await fetch(`${PHONEPE_HOST}/checkout/v2/order/${orderId}/status?details=true&errorContext=true`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `O-Bearer ${accessToken}` },
      });
      const statusData = await statusRes.json();
      const state = statusData.state || statusData.orderState || statusData.data?.state || statusData.data?.orderState;

      if (state === 'COMPLETED') {
        return NextResponse.json({ success: true, state: 'COMPLETED' });
      }
      return NextResponse.json({ success: false, state: state || 'UNKNOWN', error: 'Payment not completed' });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'initiate') {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    try {
      const { amount, cart_items, shipping_address } = await request.json();
      const merchantOrderId = `DLX-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      // Save pending order
      await supabaseAdmin.from('pending_orders').upsert({
        transaction_id: merchantOrderId,
        user_id: user.id,
        cart_items: JSON.stringify(cart_items),
        shipping_address: shipping_address ? JSON.stringify(shipping_address) : null,
        amount,
        status: 'initiated',
        created_at: new Date().toISOString(),
      });

      const accessToken = await getAccessToken();
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://daluxeofficial.in').replace(/\/$/, '');

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
        return NextResponse.json({ success: true, data: { orderId: merchantOrderId, redirectUrl: phonePeData.redirectUrl } });
      }

      return NextResponse.json({ success: false, error: phonePeData.message || 'Failed to create payment session' }, { status: 400 });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
