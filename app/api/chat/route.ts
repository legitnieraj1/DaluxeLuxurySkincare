import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
       return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Context Loading (Inject context based on the user silently)
    const { data: userOrders } = await supabaseAdmin
      .from('orders')
      .select('id, shipment_status, created_at, order_items(products(name))')
      .eq('user_id', user.id)
      .limit(3)
      .order('created_at', { ascending: false });

    let orderContext = "The user has no recent orders.";
    if (userOrders && userOrders.length > 0) {
      orderContext = "User's recent orders:\\n" + userOrders.map((o: any) => 
        `Order ${o.id.substring(0, 8)} (${o.shipment_status}): ` +
        o.order_items.map((i: any) => i.products.name).join(', ')
      ).join('\\n');
    }

    const systemMessage = {
      role: 'system',
      content: `You are the Daluxe AI Assistant, an elegant and helpful AI representing a luxury skincare brand. 
Maintain a refined, soothing, and premium tone. Never mention you are an AI model unless legally required.
${orderContext}`
    };

    const apiMessages = [systemMessage, ...messages];

    // Using a free OpenRouter model (e.g. Llama 3 8b instruct or similar high quality free tier)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Daluxe Luxury Skincare',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct:free',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message || 'OpenRouter API Error');

    return NextResponse.json({ 
      success: true, 
      message: data.choices[0].message 
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process AI response', details: error.message }, { status: 500 });
  }
}
