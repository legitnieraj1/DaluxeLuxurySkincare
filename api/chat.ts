import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

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
    if (!user) {
      console.error('[chat] Unauthorized — no valid session');
      return res.status(401).json({ success: false, error: 'Please log in to use the chat.' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Messages array is required' });
    }

    console.log('[chat] User:', user.id, 'Messages count:', messages.length);

    // Fetch recent orders for context (best-effort, don't fail on error)
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
      console.log('[chat] Could not fetch orders for context:', e);
    }

    const systemMessage = {
      role: 'system',
      content: `You are the Daluxe AI Assistant for a luxury skincare brand called "Daluxe". Be elegant, helpful, and refined in your responses. You know about skincare, beauty routines, and the following products: Kumkumadi Face Serum, Daluxe Face Wash, Luxury Hair Serum, and Restoration Night Cream. Keep responses concise (under 150 words). If asked about shipping, mention 3-5 business days across India.\n\n${orderContext}`,
    };

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      console.error('[chat] OPENROUTER_API_KEY not set');
      return res.status(500).json({ success: false, error: 'Chat service not configured' });
    }

    console.log('[chat] Calling OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app',
        'X-Title': 'Daluxe Luxury Skincare',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [systemMessage, ...messages.slice(-10)],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    console.log('[chat] OpenRouter status:', response.status);
    if (data.error) {
      console.error('[chat] OpenRouter error:', JSON.stringify(data.error));
      
      // Fallback to another free model
      console.log('[chat] Trying fallback model...');
      const fallbackRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app',
          'X-Title': 'Daluxe Luxury Skincare',
        },
        body: JSON.stringify({
          model: 'google/gemma-2-9b-it:free',
          messages: [systemMessage, ...messages.slice(-10)],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });
      const fallbackData = await fallbackRes.json();
      
      if (fallbackData.choices?.[0]?.message) {
        console.log('[chat] Fallback succeeded');
        return res.status(200).json({ success: true, message: fallbackData.choices[0].message });
      }

      return res.status(500).json({ success: false, error: 'AI service temporarily unavailable. Please try again.' });
    }

    if (!data.choices?.[0]?.message) {
      console.error('[chat] No choices in response:', JSON.stringify(data));
      return res.status(500).json({ success: false, error: 'AI returned empty response' });
    }

    console.log('[chat] Success, response length:', data.choices[0].message.content?.length);
    return res.status(200).json({ success: true, message: data.choices[0].message });

  } catch (error: any) {
    console.error('[chat] Fatal error:', error);
    return res.status(500).json({ success: false, error: 'Chat service error. Please try again.' });
  }
}
