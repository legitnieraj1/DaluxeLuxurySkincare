import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazily initialized so env vars are read at request time, not at build time.
let _razorpay: Razorpay | null = null;
export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }
  return _razorpay;
}

export const verifyRazorpaySignature = (
  order_id: string,
  payment_id: string,
  signature: string
) => {
  const body = order_id + '|' + payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body.toString())
    .digest('hex');
    
  return expectedSignature === signature;
};
