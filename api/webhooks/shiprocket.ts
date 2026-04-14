import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const token = req.headers['x-api-key'] as string;
    if (process.env.NODE_ENV === 'production' && token !== process.env.SHIPROCKET_WEBHOOK_TOKEN) {
      return res.status(401).json({ success: false, error: 'Unauthorized webhook' });
    }

    const { awb, current_status } = req.body;
    if (!awb || !current_status) return res.status(400).json({ success: false, error: 'Invalid payload' });

    const raw = current_status.toUpperCase();
    let mapped = 'processing';
    if (raw.includes('DELIVERED')) mapped = 'delivered';
    else if (raw.includes('OUT FOR DELIVERY')) mapped = 'out_for_delivery';
    else if (raw.includes('SHIPPED') || raw.includes('PICKED UP')) mapped = 'shipped';
    else if (raw.includes('CANCELLED')) mapped = 'cancelled';

    const { error } = await supabaseAdmin.from('orders').update({ shipment_status: mapped }).eq('shipment_id', awb);
    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Status synced' });

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
