"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabaseAdmin } from '@/lib/supabase/client';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { RefreshCw } from 'lucide-react';

const GOLD_COLORS = ['#D4AF37', '#E8C547', '#F5D06F', '#B8962E', '#A07820', '#C9A227', '#F0C040'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
        <p style={{ color: '#A1A1AA' }}>{label}</p>
        <p style={{ color: '#F5D06F', fontWeight: 700 }}>₹{Number(payload[0].value).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

interface AnalyticsData {
  totalRevenue: number;
  avgOrderValue: number;
  totalOrders: number;
  deliveredOrders: number;
  monthlyRevenue: { m: string; rev: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  stepBreakdown: { name: string; value: number }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, itemsRes, productsRes] = await Promise.all([
        supabaseAdmin.from('orders').select('id, status, total_amount, created_at'),
        supabaseAdmin.from('order_items').select('order_id, quantity, unit_price, total_price, products(name)'),
        supabaseAdmin.from('products').select('id, name, regimen_step, active').eq('active', true),
      ]);

      const orders = ordersRes.data || [];
      const items = itemsRes.data || [];
      const products = productsRes.data || [];

      // ── Core stats
      const delivered = orders.filter((o: any) => o.status === 'delivered');
      const totalRevenue = delivered.reduce((s: number, o: any) => s + Number(o.total_amount), 0);
      const avgOrderValue = delivered.length > 0 ? Math.round(totalRevenue / delivered.length) : 0;

      // ── Last 6 months revenue
      const now = new Date();
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const rev = orders
          .filter((o: any) => {
            const od = new Date(o.created_at);
            return od >= d && od < end && o.status !== 'cancelled';
          })
          .reduce((s: number, o: any) => s + Number(o.total_amount), 0);
        return { m: MONTHS[d.getMonth()], rev };
      });

      // ── Top products by revenue
      const productSales: Record<string, { name: string; units: number; revenue: number }> = {};
      items.forEach((item: any) => {
        const name = item.products?.name || 'Unknown';
        if (!productSales[name]) productSales[name] = { name, units: 0, revenue: 0 };
        productSales[name].units += item.quantity;
        productSales[name].revenue += Number(item.total_price || item.unit_price * item.quantity);
      });
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // ── Products by regimen step
      const stepMap: Record<string, number> = {};
      products.forEach((p: any) => {
        const step = p.regimen_step || 'Other';
        stepMap[step] = (stepMap[step] || 0) + 1;
      });
      const stepBreakdown = Object.entries(stepMap).map(([name, value]) => ({ name, value }));

      setData({
        totalRevenue,
        avgOrderValue,
        totalOrders: orders.length,
        deliveredOrders: delivered.length,
        monthlyRevenue,
        topProducts,
        stepBreakdown,
      });
    } catch (e) {
      console.error('[Analytics] load error', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-light tracking-tight" style={{ color: '#FAFAFA' }}>Analytics</h2>
          <p className="text-sm mt-1" style={{ color: '#52525B' }}>Performance overview · live Supabase data</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border disabled:opacity-40"
          style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#71717A' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading || !data ? (
        <div className="flex items-center justify-center py-32">
          <p className="text-sm" style={{ color: '#52525B' }}>Loading analytics…</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: '#52525B' }}>Total Revenue</p>
              <p className="text-3xl font-bold gold-text">₹{data.totalRevenue.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: '#3F3F46' }}>from {data.deliveredOrders} delivered orders</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: '#52525B' }}>Avg. Order Value</p>
              <p className="text-3xl font-bold" style={{ color: '#FAFAFA' }}>₹{data.avgOrderValue.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: '#3F3F46' }}>per delivered order</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: '#52525B' }}>Total Orders</p>
              <p className="text-3xl font-bold" style={{ color: '#A78BFA' }}>{data.totalOrders}</p>
              <p className="text-xs mt-1" style={{ color: '#3F3F46' }}>all time (all statuses)</p>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Monthly Revenue</h3>
                <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>Last 6 months · from real orders</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.monthlyRevenue}>
                <defs>
                  <linearGradient id="analyticsRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#3F3F46', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rev" stroke="#D4AF37" strokeWidth={2} fill="url(#analyticsRevGrad)"
                  dot={false} activeDot={{ r: 4, fill: '#D4AF37' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-5" style={{ color: '#FAFAFA' }}>Top Products by Revenue</h3>
              {data.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {data.topProducts.map((p, i) => (
                    <div key={p.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium" style={{ color: '#A1A1AA' }}>{p.name}</span>
                        <div className="text-right">
                          <span className="text-xs font-semibold" style={{ color: '#FAFAFA' }}>₹{p.revenue.toLocaleString()}</span>
                          <span className="text-[10px] ml-2" style={{ color: '#52525B' }}>{p.units} units</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-1.5 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #D4AF37, #F5D06F)',
                            width: `${Math.min(100, (p.revenue / (data.topProducts[0]?.revenue || 1)) * 100)}%`
                          }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-36">
                  <p className="text-xs text-center" style={{ color: '#3F3F46' }}>No sales data yet.<br />Orders will appear here once placed.</p>
                </div>
              )}
            </div>

            {/* Regimen Step Breakdown */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-5" style={{ color: '#FAFAFA' }}>Products by Regimen Step</h3>
              {data.stepBreakdown.length > 0 ? (
                <div className="flex items-center gap-4">
                  <PieChart width={120} height={120}>
                    <Pie data={data.stepBreakdown} cx={55} cy={55} innerRadius={30} outerRadius={55}
                      paddingAngle={3} dataKey="value">
                      {data.stepBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={GOLD_COLORS[index % GOLD_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="space-y-2 flex-1 min-w-0">
                    {data.stepBreakdown.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: GOLD_COLORS[i % GOLD_COLORS.length] }} />
                        <span className="text-xs truncate" style={{ color: '#A1A1AA' }}>{d.name}</span>
                        <span className="text-xs ml-auto font-medium shrink-0" style={{ color: '#FAFAFA' }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs" style={{ color: '#3F3F46' }}>No products yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
