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

// ─── OAuth Token Cache ───────────────────────────
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  console.log('[phonepe] Requesting new OAuth token...');

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
    console.error('[phonepe] OAuth token error:', JSON.stringify(data));
    throw new Error(data.message || 'Failed to get PhonePe access token');
  }

  cachedToken = data.access_token;
  // Expire 60 seconds early to be safe
  tokenExpiresAt = (data.expires_at || Date.now() + 14 * 60 * 1000) - 60000;

  console.log('[phonepe] Token acquired, expires at:', new Date(tokenExpiresAt).toISOString());
  return cachedToken!;
}

// ─── Auth Helper ─────────────────────────────────
async function getUser(req: VercelRequest) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ─── Handler ─────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });

    const { amount, cart_items, shipping_address } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid payment amount' });
    }

    // Generate unique order ID
    const merchantOrderId = `DALUXE-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    console.log('[phonepe/initiate] User:', user.id, 'Amount:', amount, 'OrderId:', merchantOrderId);

    // Store pending order for idempotency
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

    // Get OAuth access token
    const accessToken = await getAccessToken();

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app').replace(/\/$/, '');

    // PhonePe Standard Checkout v2/pay
    const paymentPayload = {
      merchantOrderId,
      amount: Math.round(amount * 100), // paise
      expireAfter: 1200, // 20 minutes
      paymentFlow: {
        type: 'PG_CHECKOUT',
        merchantUrls: {
          redirectUrl: `${appUrl}/api/checkout/phonepe/callback?orderId=${merchantOrderId}`,
        },
      },
      metaInfo: {
        udf1: user.id,
        udf2: user.email || '',
      },
    };

    console.log('[phonepe/initiate] Payment payload:', JSON.stringify(paymentPayload));

    const phonePeRes = await fetch(`${PHONEPE_HOST}/checkout/v2/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentPayload),
    });

    const phonePeData = await phonePeRes.json();

    console.log('[phonepe/initiate] PhonePe response status:', phonePeRes.status);
    console.log('[phonepe/initiate] PhonePe response:', JSON.stringify(phonePeData));

    if (phonePeRes.ok && phonePeData.redirectUrl) {
      return res.status(200).json({
        success: true,
        data: {
          orderId: merchantOrderId,
          redirectUrl: phonePeData.redirectUrl,
        },
      });
    }

    // Handle specific error cases
    if (phonePeData.code === 'INVALID_MERCHANT') {
      return res.status(400).json({ success: false, error: 'Payment gateway configuration error. Contact support.' });
    }

    return res.status(400).json({
      success: false,
      error: phonePeData.message || 'Failed to create payment session',
      code: phonePeData.code,
    });

  } catch (error: any) {
    console.error('[phonepe/initiate] Fatal error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
