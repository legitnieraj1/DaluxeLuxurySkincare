"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Search, Mail, Phone, ShoppingBag, RefreshCw } from 'lucide-react';

interface Customer {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  orderCount: number;
  totalSpent: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    // Fetch all profiles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, phone, role, created_at')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    // Fetch all orders for aggregation
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('user_id, total_amount, status');

    const profileList = profiles || [];
    const orderList = orders || [];

    // Aggregate order count & total spent per customer
    const enriched: Customer[] = profileList.map((p: any) => {
      const userOrders = orderList.filter((o: any) => o.user_id === p.id);
      const totalSpent = userOrders
        .filter((o: any) => o.status === 'delivered')
        .reduce((s: number, o: any) => s + Number(o.total_amount), 0);
      return {
        ...p,
        orderCount: userOrders.length,
        totalSpent,
      };
    });

    setCustomers(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !q
      || c.full_name?.toLowerCase().includes(q)
      || c.email?.toLowerCase().includes(q)
      || c.phone?.includes(q);
  });

  const topSpender = filtered.length > 0
    ? [...filtered].sort((a, b) => b.totalSpent - a.totalSpent)[0]
    : null;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-light tracking-tight" style={{ color: '#FAFAFA' }}>Customers</h2>
          <p className="text-sm mt-1" style={{ color: '#52525B' }}>{customers.length} registered customers</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} disabled={loading} className="ghost-btn p-2 rounded-lg disabled:opacity-40">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#52525B' }} />
            <input className="dark-input pl-9 pr-3 py-2.5 text-sm w-60" placeholder="Search customers…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Top Spender Card */}
      {!loading && topSpender && topSpender.totalSpent > 0 && (
        <div className="glass-card p-5 mb-6 flex items-center gap-5"
          style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
            style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D06F)', color: '#0B0B0B' }}>
            {(topSpender.full_name || topSpender.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold" style={{ color: '#FAFAFA' }}>{topSpender.full_name || '—'}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                TOP CUSTOMER
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>{topSpender.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#52525B' }}>Total Spent</p>
            <p className="text-xl font-bold gold-text">₹{topSpender.totalSpent.toLocaleString()}</p>
            <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>{topSpender.orderCount} orders</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Customer', 'Contact', 'Orders', 'Total Spent (Delivered)', 'Joined'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: '#3F3F46' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-16 text-sm" style={{ color: '#52525B' }}>Loading customers…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-sm" style={{ color: '#3F3F46' }}>No customers found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {/* Name + Avatar */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.15)' }}>
                      {(c.full_name || c.email || '?')[0].toUpperCase()}
                    </div>
                    <p className="font-medium text-sm" style={{ color: '#FAFAFA' }}>{c.full_name || '—'}</p>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#71717A' }}>
                      <Mail size={11} /> {c.email || '—'}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#71717A' }}>
                      <Phone size={11} /> {c.phone || '—'}
                    </span>
                  </div>
                </td>

                {/* Order count */}
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#FAFAFA' }}>
                    <ShoppingBag size={13} style={{ color: '#A78BFA' }} /> {c.orderCount}
                  </span>
                </td>

                {/* Total spent */}
                <td className="px-5 py-4 font-bold text-sm gold-text">
                  {c.totalSpent > 0 ? `₹${c.totalSpent.toLocaleString()}` : '—'}
                </td>

                {/* Joined */}
                <td className="px-5 py-4 text-xs" style={{ color: '#52525B' }}>
                  {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
