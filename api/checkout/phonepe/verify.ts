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

async function getUser(req: VercelRequest) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Accept orderId from query (callback redirect) or body (frontend check)
    const orderId = (req.query.orderId as string) || req.body?.orderId;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Missing orderId' });
    }

    console.log('[phonepe/verify] Verifying order:', orderId);

    // Idempotency check
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('transaction_id', orderId)
      .single();

    if (existingOrder) {
      return res.status(200).json({ success: true, message: 'Order already processed', order: existingOrder });
    }

    const accessToken = await getAccessToken();

    const statusRes = await fetch(
      `${PHONEPE_HOST}/checkout/v2/order/${orderId}/status?details=true&errorContext=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${accessToken}`,
        },
      }
    );

    const statusData = await statusRes.json();
    console.log('[phonepe/verify] Status:', JSON.stringify(statusData));

    const state = statusData.state || statusData.orderState;

    if (state === 'COMPLETED') {
      return res.status(200).json({ success: true, state: 'COMPLETED' });
    }

    if (state === 'FAILED') {
      return res.status(200).json({ success: false, state: 'FAILED', error: statusData.errorContext?.description || 'Payment failed' });
    }

    return res.status(200).json({ success: false, state: state || 'UNKNOWN', error: 'Payment not completed' });

  } catch (error: any) {
    console.error('[phonepe/verify] Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
