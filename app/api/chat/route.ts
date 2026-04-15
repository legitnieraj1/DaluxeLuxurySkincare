import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
    const user = await requireAuth();

    // --- 3. Parse & validate request body ---
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'A non-empty messages array is required.' },
        { status: 400 }
      );
    }

    // --- 4. Load user order context ---
    const { data: userOrders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, shipment_status, created_at, order_items(products(name))')
      .eq('user_id', user.id)
      .limit(3)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('[Chat] Failed to fetch user orders:', ordersError.message);
    }

    let orderContext = 'The user has no recent orders.';
    if (userOrders && userOrders.length > 0) {
      orderContext =
        "User's recent orders:\n" +
        userOrders
          .map(
            (o: any) =>
              `Order ${o.id.substring(0, 8)} (${o.shipment_status}): ` +
              o.order_items.map((i: any) => i.products?.name ?? 'Unknown product').join(', ')
          )
          .join('\n');
    }

    const systemMessage = {
      role: 'system',
      content: `You are the Daluxe AI Assistant, an elegant and helpful AI representing a luxury skincare brand. 
Maintain a refined, soothing, and premium tone. Never mention you are an AI model unless legally required.
${orderContext}`,
    };

    const apiMessages = [systemMessage, ...messages];

    // --- 5. Call OpenRouter ---
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Daluxe',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    // --- 6. Validate HTTP status before parsing ---
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Chat] OpenRouter returned HTTP ${response.status} ${response.statusText}:`,
        errorText
      );
      return NextResponse.json(
        {
          success: false,
          error: `AI service returned an error (HTTP ${response.status}). Please try again later.`,
        },
        { status: 502 }
      );
    }

    // --- 7. Parse and validate response shape ---
    const data = await response.json();

    if (data.error) {
      console.error('[Chat] OpenRouter API error object:', data.error);
      throw new Error(data.error.message || 'OpenRouter API returned an error.');
    }

    const messageContent: string | undefined = data?.choices?.[0]?.message?.content;
    if (!messageContent) {
      console.error('[Chat] Unexpected response shape from OpenRouter:', JSON.stringify(data));
      throw new Error('Received an empty or malformed response from the AI service.');
    }

    // --- 8. Return success ---
    // Response shape keeps `message` for frontend compatibility
    return NextResponse.json({
      success: true,
      message: data.choices[0].message,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[Chat] Unhandled error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'AI service temporarily unavailable. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
