"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Search, X, RefreshCw, ChevronDown } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-pending', confirmed: 'badge-confirmed', processing: 'badge-confirmed',
  shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};
const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  promo_code_used: string | null;
  payment_method: string | null;
  payment_id: string | null;
  shipping_address: any;
  tracking_url: string | null;
  created_at: string;
  order_items: { quantity: number; unit_price: number; products: { name: string } | null }[];
}

function OrderModal({ order, onClose, onSave }: { order: Order; onClose: () => void; onSave: () => void }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabaseAdmin.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', order.id);
    setSaving(false);
    onSave();
    onClose();
  }

  const addr = order.shipping_address || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="glass-card w-full max-w-xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.2)', background: '#111' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h3 className="font-semibold text-base" style={{ color: '#FAFAFA' }}>{order.order_number}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>
              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="ghost-btn p-2 rounded-lg"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Customer */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: '#52525B' }}>Customer</p>
            <p className="font-semibold text-sm" style={{ color: '#FAFAFA' }}>{addr.name || '—'}</p>
            <p className="text-xs mt-1" style={{ color: '#71717A' }}>{addr.phone} · {addr.email}</p>
            <p className="text-xs mt-1" style={{ color: '#71717A' }}>{addr.address}, {addr.city} — {addr.pincode}</p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: '#52525B' }}>Items</p>
            <div className="space-y-2">
              {order.order_items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{item.products?.name || 'Product'}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm" style={{ color: '#FAFAFA' }}>₹{(item.unit_price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <div>
              <p className="text-xs" style={{ color: '#A1A1AA' }}>Order Total</p>
              <p className="text-xl font-bold gold-text">₹{Number(order.total_amount).toLocaleString()}</p>
              {order.promo_code_used && (
                <p className="text-xs mt-1" style={{ color: '#10B981' }}>
                  Promo: {order.promo_code_used} (–₹{Number(order.discount_amount).toLocaleString()})
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#52525B' }}>Payment</p>
              <p className="text-xs font-mono mt-0.5" style={{ color: '#71717A' }}>{order.payment_method?.toUpperCase() || 'COD'}</p>
              {order.payment_id && <p className="text-[10px] font-mono mt-0.5" style={{ color: '#3F3F46' }}>{order.payment_id}</p>}
            </div>
          </div>

          {/* Tracking */}
          {order.tracking_url && (
            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
              className="block text-xs text-center py-2 rounded-lg"
              style={{ background: 'rgba(96,165,250,0.08)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.2)' }}>
              Track Shipment →
            </a>
          )}

          {/* Status Update */}
          <div>
            <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: '#52525B' }}>Update Status</p>
            <select value={status} onChange={e => setStatus(e.target.value)} className="dark-input w-full px-3 py-2.5 text-sm">
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onClose} className="ghost-btn flex-1 py-2 text-sm rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="gold-btn flex-1 py-2 text-sm rounded-lg disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(quantity, unit_price, products(name))')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const q = search.toLowerCase();
    const addr = o.shipping_address || {};
    const matchSearch = !q
      || o.order_number?.toLowerCase().includes(q)
      || addr.name?.toLowerCase().includes(q)
      || addr.phone?.includes(q);
    return matchTab && matchSearch;
  });

  const tabs = [
    { key: 'all', label: `All (${orders.length})` },
    ...ALL_STATUSES.map(s => ({ key: s, label: `${s.charAt(0).toUpperCase() + s.slice(1)} (${orders.filter(o => o.status === s).length})` })),
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} onSave={load} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-light tracking-tight" style={{ color: '#FAFAFA' }}>Orders</h2>
          <p className="text-sm mt-1" style={{ color: '#52525B' }}>{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} disabled={loading} className="ghost-btn p-2 rounded-lg disabled:opacity-40">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#52525B' }} />
            <input className="dark-input pl-9 pr-3 py-2.5 text-sm w-60" placeholder="Search order or customer…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="text-xs px-3 py-1.5 rounded-full capitalize transition-all"
            style={activeTab === tab.key
              ? { background: 'linear-gradient(135deg,#D4AF37,#F5D06F)', color: '#0B0B0B', fontWeight: 700 }
              : { background: 'rgba(255,255,255,0.04)', color: '#71717A', border: '1px solid rgba(255,255,255,0.06)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Order ID', 'Customer', 'Date', 'Total', 'Promo', 'Status', 'Items'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#52525B' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-16 text-sm" style={{ color: '#52525B' }}>Loading orders…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-sm" style={{ color: '#3F3F46' }}>No orders found</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} onClick={() => setSelected(o)}
                className="table-row-hover cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: '#FAFAFA' }}>{o.order_number}</td>
                <td className="px-4 py-3" style={{ color: '#A1A1AA' }}>{o.shipping_address?.name || '—'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#71717A' }}>
                  {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-4 py-3 font-semibold" style={{ color: '#FAFAFA' }}>₹{Number(o.total_amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#10B981' }}>{o.promo_code_used || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${STATUS_COLORS[o.status] || 'badge-pending'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: '#71717A' }}>{o.order_items?.length || 0} items</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
