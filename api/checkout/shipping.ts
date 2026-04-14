import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { pincode, weight, payment } = req.query;

    if (!pincode || String(pincode).length < 6) {
      return res.status(400).json({ serviceable: false, error: 'Invalid pincode' });
    }

    // Flat rate shipping logic (replace with Shiprocket API call when ready)
    const w = parseFloat(String(weight) || '0.5');
    let rate = 49;
    if (w > 1) rate = 99;
    if (w > 2) rate = 149;

    // COD attracts an extra charge
    if (payment === 'cod') rate += 40;

    // Free shipping over ₹599
    // (frontend can override this logic if needed)

    return res.status(200).json({ serviceable: true, rate, estimated_days: '3-5' });

  } catch (error: any) {
    return res.status(500).json({ serviceable: false, error: error.message });
  }
}
