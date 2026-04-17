import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Extract user from Authorization header using service role client
async function getUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function POST(request: Request) {
  // --- 1. Validate environment ---
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.error('[Chat] FATAL: OPENROUTER_API_KEY is not set in environment variables.');
    return NextResponse.json(
      { success: false, error: 'AI service is not configured. Please contact support.' },
      { status: 503 }
    );
  }

  try {
    // --- 2. Auth ---
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please log in to use the chat.' },
        { status: 401 }
      );
    }

    // --- 3. Parse & validate request body ---
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'A non-empty messages array is required.' },
        { status: 400 }
      );
    }

    console.log('[Chat] User:', user.id, 'Messages count:', messages.length);

    // --- 4. Load user order context (best-effort) ---
    let orderContext = 'The user has no recent orders.';
    try {
      const { data: userOrders } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, status, shipment_status, total_amount, created_at')
        .eq('user_id', user.id)
        .limit(3)
        .order('created_at', { ascending: false });

      if (userOrders && userOrders.length > 0) {
        orderContext = 'User recent orders:\n' + userOrders.map((o: any) =>
          `Order ${o.order_number} (Status: ${o.status}, Shipment: ${o.shipment_status || 'pending'}, Amount: ₹${o.total_amount})`
        ).join('\n');
      }
    } catch (e) {
      console.log('[Chat] Could not fetch orders for context:', e);
    }

    const systemMessage = {
      role: 'system',
      content: `You are the Daluxe AI Assistant for a luxury skincare brand called "Daluxe". Be elegant, helpful, and refined in your responses. You know about skincare, beauty routines, and the following products: Kumkumadi Face Serum, Daluxe Face Wash, Luxury Hair Serum, and Restoration Night Cream. Keep responses concise (under 150 words). If asked about shipping, mention 3-5 business days across India.\n\n${orderContext}`,
    };

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app';

    // --- 5. Call OpenRouter with primary model ---
    console.log('[Chat] Calling OpenRouter API...');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': APP_URL,
        'X-Title': 'Daluxe Luxury Skincare',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [systemMessage, ...messages.slice(-10)],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    console.log('[Chat] OpenRouter status:', response.status);

    if (data.error) {
      console.error('[Chat] OpenRouter error:', JSON.stringify(data.error));

      // Fallback to another free model
      console.log('[Chat] Trying fallback model...');
      const fallbackRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': APP_URL,
          'X-Title': 'Daluxe Luxury Skincare',
        },
        body: JSON.stringify({
          model: 'google/gemma-4-26b-a4b-it:free',
          messages: [systemMessage, ...messages.slice(-10)],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });
      const fallbackData = await fallbackRes.json();

      if (fallbackData.choices?.[0]?.message) {
        console.log('[Chat] Fallback succeeded');
        return NextResponse.json({ success: true, message: fallbackData.choices[0].message });
      }

      return NextResponse.json(
        { success: false, error: 'AI service temporarily unavailable. Please try again.' },
        { status: 500 }
      );
    }

    if (!data.choices?.[0]?.message) {
      console.error('[Chat] No choices in response:', JSON.stringify(data));
      return NextResponse.json(
        { success: false, error: 'AI returned empty response' },
        { status: 500 }
      );
    }

    console.log('[Chat] Success, response length:', data.choices[0].message.content?.length);
    return NextResponse.json({ success: true, message: data.choices[0].message });

  } catch (error: any) {
    console.error('[Chat] Fatal error:', error);
    return NextResponse.json(
      { success: false, error: 'Chat service error. Please try again.' },
      { status: 500 }
    );
  }
}
