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
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ success: false, error: 'Messages array required' });

    const { data: userOrders } = await supabaseAdmin
      .from('orders')
      .select('id, shipment_status, created_at, order_items(products(name))')
      .eq('user_id', user.id)
      .limit(3)
      .order('created_at', { ascending: false });

    let orderContext = 'The user has no recent orders.';
    if (userOrders && userOrders.length > 0) {
      orderContext = 'User recent orders:\n' + userOrders.map((o: any) =>
        `Order ${o.id.substring(0, 8)} (${o.shipment_status}): ${o.order_items.map((i: any) => i.products.name).join(', ')}`
      ).join('\n');
    }

    const systemMessage = {
      role: 'system',
      content: `You are the Daluxe AI Assistant for a luxury skincare brand. Be elegant, helpful, and refined.\n${orderContext}`,
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://daluxex-elevex.vercel.app',
        'X-Title': 'Daluxe Luxury Skincare',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct:free',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'AI API Error');

    return res.status(200).json({ success: true, message: data.choices[0].message });

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
