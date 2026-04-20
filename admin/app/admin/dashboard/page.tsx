"use client";

import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase/client';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from 'recharts';
import { TrendingUp, ShoppingBag, Clock, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-pending', confirmed: 'badge-confirmed', processing: 'badge-confirmed',
  shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
        <p style={{ color: '#A1A1AA' }}>{label}</p>
        <p style={{ color: '#F5D06F', fontWeight: 700 }}>
          {payload[0].name === 'revenue' ? `₹${Number(payload[0].value).toLocaleString()}` : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  lowStock: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: any;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
}

interface ChartPoint { day: string; revenue: number; orders: number; }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalOrders: 0, activeOrders: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        supabaseAdmin.from('orders').select('id,order_number,status,total_amount,created_at,shipping_address').order('created_at', { ascending: false }),
        supabaseAdmin.from('products').select('id,name,stock_quantity').eq('active', true),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];

      // Stats
      const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s: number, o: any) => s + Number(o.total_amount), 0);
      const activeOrders = orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length;
      const lowStock = products.filter((p: any) => p.stock_quantity <= 10).length;

      setStats({ totalRevenue, totalOrders: orders.length, activeOrders, lowStock });
      setRecentOrders(orders.slice(0, 5));
      setLowStockProducts(products.filter((p: any) => p.stock_quantity <= 10).slice(0, 5));

      // Build last-7-days chart from real orders
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();
      const chart: ChartPoint[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        const dayStr = days[d.getDay()];
        const dayOrders = orders.filter((o: any) => {
          const od = new Date(o.created_at);
          return od.toDateString() === d.toDateString();
        });
        return {
          day: dayStr,
          revenue: dayOrders.reduce((s: number, o: any) => s + Number(o.total_amount), 0),
          orders: dayOrders.length,
        };
      });
      setChartData(chart);
    } catch (e) {
      console.error('[Dashboard] load error', e);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-light tracking-tight" style={{ color: '#FAFAFA' }}>
            {greeting}, <span className="gold-text font-semibold">Daluxe</span>
          </h2>
          <p className="mt-1 text-sm" style={{ color: '#52525B' }}>Live data from Supabase</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border disabled:opacity-40"
          style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#71717A' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue"       value={`₹${stats.totalRevenue.toLocaleString()}`} sub="from delivered orders"   icon={TrendingUp}   accent="#D4AF37" />
        <StatCard label="Total Orders"         value={String(stats.totalOrders)}                 sub="all time"               icon={ShoppingBag}  accent="#60A5FA" />
        <StatCard label="Active Orders"        value={String(stats.activeOrders)}                sub="pending / processing"   icon={Clock}        accent="#A78BFA" />
        <StatCard label="Low / Out of Stock"   value={String(stats.lowStock)}                   sub="products need attention" icon={AlertTriangle} accent="#F87171" urgent={stats.lowStock > 0} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Revenue (last 7 days)</h3>
              <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>From real orders</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#3F3F46', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#D4AF37' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Orders (last 7 days)</h3>
              <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>From real orders</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#3F3F46', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="orders" fill="rgba(96,165,250,0.6)" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Recent Orders */}
        <div className="col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Recent Orders</h3>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs hover:opacity-80" style={{ color: '#D4AF37' }}>
              View all <ExternalLink size={11} />
            </Link>
          </div>
          {loading ? (
            <p className="text-xs text-center py-8" style={{ color: '#52525B' }}>Loading…</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: '#3F3F46' }}>No orders yet</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Order', 'Customer', 'Total', 'Status'].map(h => (
                    <th key={h} className="pb-3 font-medium text-left" style={{ color: '#52525B' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="py-3 font-mono" style={{ color: '#FAFAFA' }}>{o.order_number}</td>
                    <td className="py-3" style={{ color: '#A1A1AA' }}>{o.shipping_address?.name || '—'}</td>
                    <td className="py-3 font-semibold" style={{ color: '#FAFAFA' }}>₹{Number(o.total_amount).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${STATUS_COLORS[o.status] || 'badge-pending'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low Stock */}
        <div className="col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Stock Alerts</h3>
            <Link href="/admin/products" className="flex items-center gap-1 text-xs hover:opacity-80" style={{ color: '#D4AF37' }}>
              Manage <ExternalLink size={11} />
            </Link>
          </div>
          {loading ? (
            <p className="text-xs text-center py-8" style={{ color: '#52525B' }}>Loading…</p>
          ) : lowStockProducts.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: '#3F3F46' }}>All products well stocked ✓</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs font-medium" style={{ color: '#FAFAFA' }}>{p.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.stock_quantity === 0 ? 'badge-outofstock' : 'badge-low'}`}>
                    {p.stock_quantity === 0 ? 'OUT' : `${p.stock_quantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent, urgent }: {
  label: string; value: string; sub: string; icon: any; accent: string; urgent?: boolean;
}) {
  return (
    <div className="glass-card p-5" style={urgent ? { borderColor: 'rgba(248,113,113,0.3)' } : {}}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium tracking-wide uppercase" style={{ color: '#52525B' }}>{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}15` }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: '#FAFAFA' }}>{value}</p>
      <p className="text-[11px] mt-1" style={{ color: '#52525B' }}>{sub}</p>
    </div>
  );
}
