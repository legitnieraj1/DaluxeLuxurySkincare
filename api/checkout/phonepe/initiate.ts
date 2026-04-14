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

async function getUser(req: VercelRequest) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });

    const { amount, cart_items, shipping_address } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid payment amount' });
    }

    console.log('[phonepe/initiate] User:', user.id, 'Amount:', amount);

    // Generate idempotent transaction ID
    const transactionId = `DALUXE_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`.toUpperCase();

    // Store pending order in DB for idempotency (map transactionId -> cart)
    if (cart_items && cart_items.length > 0) {
      const { error: pendingError } = await supabaseAdmin
        .from('pending_orders')
        .upsert({
          transaction_id: transactionId,
          user_id: user.id,
          cart_items: JSON.stringify(cart_items),
          shipping_address: shipping_address ? JSON.stringify(shipping_address) : null,
          amount,
          status: 'initiated',
          created_at: new Date().toISOString()
        });
      
      if (pendingError) {
        console.warn('[phonepe/initiate] Could not store pending order:', pendingError.message);
        // Continue anyway — not critical for payment initiation
      }
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app').replace(/\/$/, '');

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: user.id.substring(0, 36),
      amount: Math.round(amount * 100), // paise
      redirectUrl: `${appUrl}/api/checkout/phonepe/callback?txn=${transactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${appUrl}/api/checkout/phonepe/verify`,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    console.log('[phonepe/initiate] Payload:', JSON.stringify(payload, null, 2));

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const endpoint = '/pg/v1/pay';
    const stringToHash = base64Payload + endpoint + PHONEPE_SALT_KEY;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256Hash + '###' + PHONEPE_SALT_INDEX;

    console.log('[phonepe/initiate] Hitting PhonePe:', `${PHONEPE_HOST}${endpoint}`);

    const phonePeRes = await fetch(`${PHONEPE_HOST}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const phonePeData = await phonePeRes.json();

    console.log('[phonepe/initiate] PhonePe response:', JSON.stringify(phonePeData));

    if (phonePeData.success && phonePeData.data?.instrumentResponse?.redirectInfo?.url) {
      return res.status(200).json({
        success: true,
        data: {
          transactionId,
          url: phonePeData.data.instrumentResponse.redirectInfo.url
        }
      });
    } else {
      console.error('[phonepe/initiate] PhonePe rejected:', phonePeData);
      return res.status(400).json({
        success: false,
        error: phonePeData.message || 'PhonePe rejected the payment request',
        code: phonePeData.code
      });
    }

  } catch (error: any) {
    console.error('[phonepe/initiate] Fatal error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
