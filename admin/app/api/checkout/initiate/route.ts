import { NextResponse } from 'next/server';
import { getRazorpay } from '@/lib/razorpay';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt = `rcpt_${uuidv4()}` } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt,
    };

    const order = await getRazorpay().orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
