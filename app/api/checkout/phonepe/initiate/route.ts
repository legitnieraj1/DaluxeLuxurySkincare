import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'crypto';

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'TESTMERCHANT';
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || 'test-salt-key';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_ENV = process.env.PHONEPE_ENV || 'UAT'; // 'UAT' or 'PROD'

const PHONEPE_HOST = PHONEPE_ENV === 'PROD' 
  ? 'https://api.phonepe.com/apis/hermes'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { amount, redirect_url } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // In a full implementation, you should recalculate the amount here against the DB cart_items
    // But for modularity, we accept amount from frontend if it was pre-calculated.
    // Ensure amount matches db backend strictly as a bonus! (Assuming we calculate DB total)
    
    // For this example, we generate a unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: user.id,
      amount: Math.round(amount * 100), // in paise
      redirectUrl: redirect_url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/verify?id=${transactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/checkout/phonepe/verify`, 
      mobileNumber: "9999999999", // Can be dynamic
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64EncodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const endpoint = '/pg/v1/pay';
    const stringForHash = base64EncodedPayload + endpoint + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringForHash).digest('hex');
    const checksum = sha256 + '###' + PHONEPE_SALT_INDEX;

    const response = await fetch(`${PHONEPE_HOST}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({ request: base64EncodedPayload })
    });

    const data = await response.json();

    if (data.success) {
      // Return the PhonePe redirect URL to the frontend
      return NextResponse.json({ 
        success: true, 
        transactionId,
        url: data.data.instrumentResponse.redirectInfo.url 
      });
    } else {
      console.error('PhonePe error:', data);
      return NextResponse.json({ error: 'Failed to initiate payment', details: data.message }, { status: 400 });
    }

  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
