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

    const { cart_items } = req.body;

    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    for (const item of cart_items) {
      if (!item.product_id || typeof item.quantity !== 'number' || item.quantity < 1) {
        return res.status(400).json({ success: false, error: 'Invalid cart item format' });
      }
    }

    const productIds = cart_items.map((item: any) => item.product_id);

    console.log('[validate] Checking stock for products:', productIds);

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, stock_quantity, price')
      .in('id', productIds);

    if (error) {
      console.error('[validate] Supabase error:', error);
      return res.status(500).json({ success: false, error: 'Database error while checking stock' });
    }

    console.log('[validate] Products found:', products?.length, 'of', productIds.length);

    for (const item of cart_items) {
      const product = products?.find((p: any) => p.id === item.product_id);

      if (!product) {
        console.warn(`[validate] Product not found: ${item.product_id}`);
        return res.status(400).json({ 
          success: false, 
          error: `Product not found: ${item.name || item.product_id}` 
        });
      }

      if (product.stock_quantity < item.quantity) {
        console.warn(`[validate] Insufficient stock for ${product.name}: have ${product.stock_quantity}, need ${item.quantity}`);
        return res.status(400).json({ 
          success: false, 
          error: `"${product.name}" is out of stock (only ${product.stock_quantity} available)` 
        });
      }
    }

    console.log('[validate] All stock validated successfully');
    return res.status(200).json({ success: true, message: 'Stock validated' });

  } catch (error: any) {
    console.error('[validate] Unexpected error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
