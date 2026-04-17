/**
 * Shiprocket Integration Helper
 * Shared module for authenticating with Shiprocket and creating orders.
 */

const SHIPROCKET_BASE_URL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

let cachedShiprocketToken: string | null = null;
let shiprocketTokenExpiresAt: number = 0;

export async function getShiprocketToken(): Promise<string | null> {
  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    console.warn('[Shiprocket] Missing credentials, skipping Shiprocket integration');
    return null;
  }

  if (cachedShiprocketToken && Date.now() < shiprocketTokenExpiresAt) {
    return cachedShiprocketToken;
  }

  try {
    const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
    });
    const data = await res.json();
    if (!data.token) {
      console.error('[Shiprocket] Auth failed:', data);
      return null;
    }
    cachedShiprocketToken = data.token;
    // Shiprocket tokens last 10 days, refresh after 9
    shiprocketTokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
    return cachedShiprocketToken;
  } catch (err) {
    console.error('[Shiprocket] Auth error:', err);
    return null;
  }
}

interface ShiprocketOrderParams {
  order_id: string;
  order_number: string;
  order_date: string;
  billing_customer_name: string;
  billing_phone: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_pincode: string;
  billing_email: string;
  shipping_is_billing: boolean;
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    weight: string;
  }>;
}

export interface ShiprocketOrderResult {
  success: boolean;
  shipment_id?: string;
  order_id?: string;
  awb_code?: string;
  tracking_url?: string;
  error?: string;
}

export async function createShiprocketOrder(params: ShiprocketOrderParams): Promise<ShiprocketOrderResult> {
  const token = await getShiprocketToken();
  if (!token) {
    console.warn('[Shiprocket] No token available, skipping order creation');
    return { success: false, error: 'Shiprocket authentication failed' };
  }

  try {
    const orderPayload = {
      order_id: params.order_number,
      order_date: params.order_date,
      pickup_location: 'Primary',
      billing_customer_name: params.billing_customer_name,
      billing_last_name: '',
      billing_address: params.billing_address,
      billing_city: params.billing_city,
      billing_pincode: params.billing_pincode,
      billing_state: params.billing_state,
      billing_country: 'India',
      billing_email: params.billing_email,
      billing_phone: params.billing_phone,
      shipping_is_billing: params.shipping_is_billing,
      order_items: params.items,
      payment_method: params.payment_method,
      sub_total: params.sub_total,
      length: 20,
      breadth: 15,
      height: 10,
      weight: 0.5,
    };

    console.log('[Shiprocket] Creating order:', params.order_number);

    const res = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();

    if (data.order_id) {
      console.log('[Shiprocket] Order created:', data.order_id, 'Shipment:', data.shipment_id);

      // Try to get AWB assignment
      let awb_code = data.awb_code || null;
      let tracking_url = null;

      if (data.shipment_id && !awb_code) {
        try {
          const awbRes = await fetch(`${SHIPROCKET_BASE_URL}/courier/assign/awb`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ shipment_id: data.shipment_id }),
          });
          const awbData = await awbRes.json();
          if (awbData.response?.data?.awb_code) {
            awb_code = awbData.response.data.awb_code;
            tracking_url = `https://shiprocket.co/tracking/${awb_code}`;
          }
        } catch (awbErr) {
          console.warn('[Shiprocket] AWB assignment skipped:', awbErr);
        }
      }

      if (awb_code && !tracking_url) {
        tracking_url = `https://shiprocket.co/tracking/${awb_code}`;
      }

      return {
        success: true,
        order_id: String(data.order_id),
        shipment_id: data.shipment_id ? String(data.shipment_id) : undefined,
        awb_code: awb_code || undefined,
        tracking_url: tracking_url || undefined,
      };
    }

    console.error('[Shiprocket] Order creation failed:', data);
    return { success: false, error: data.message || 'Shiprocket order creation failed' };
  } catch (err: any) {
    console.error('[Shiprocket] Order creation error:', err);
    return { success: false, error: err.message || 'Shiprocket API error' };
  }
}
