"use client";
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, Copy, Check, X, TrendingUp, Users, DollarSign, Tag } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  influencer_name: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  commission_pct: number;
  active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  total_revenue: number;
  total_commission: number;
  created_at: string;
}

const EMPTY: Omit<PromoCode, 'id' | 'used_count' | 'total_revenue' | 'total_commission' | 'created_at'> = {
  code: '',
  influencer_name: '',
  discount_type: 'percentage',
  discount_value: 20,
  commission_pct: 20,
  active: true,
  expires_at: '',
  usage_limit: null,
};

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    setCodes(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  }

  function openEdit(code: PromoCode) {
    setEditing(code);
    setForm({
      code: code.code,
      influencer_name: code.influencer_name || '',
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      commission_pct: code.commission_pct,
      active: code.active,
      expires_at: code.expires_at ? code.expires_at.slice(0, 16) : '',
      usage_limit: code.usage_limit,
    });
    setError('');
    setShowForm(true);
  }

  async function save() {
    setError('');
    if (!form.code.trim()) { setError('Code is required'); return; }
    if (form.discount_value <= 0) { setError('Discount value must be > 0'); return; }

    setSaving(true);
    const payload = {
      code: form.code.toUpperCase().trim(),
      influencer_name: form.influencer_name || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      commission_pct: Number(form.commission_pct),
      active: form.active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
    };

    if (editing) {
      await supabaseAdmin.from('promo_codes').update(payload).eq('id', editing.id);
    } else {
      await supabaseAdmin.from('promo_codes').insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    load();
  }

  async function toggleActive(code: PromoCode) {
    await supabaseAdmin.from('promo_codes').update({ active: !code.active }).eq('id', code.id);
    load();
  }

  async function deleteCode(id: string) {
    await supabaseAdmin.from('promo_codes').delete().eq('id', id);
    setDeleteConfirm(null);
    load();
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  // Stats
  const totalRevenue = codes.reduce((s, c) => s + c.total_revenue, 0);
  const totalCommission = codes.reduce((s, c) => s + c.total_commission, 0);
  const totalUses = codes.reduce((s, c) => s + c.used_count, 0);

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6" style={{ backgroundColor: '#0B0B0B', color: '#FAFAFA' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-wide">Promo Codes</h1>
          <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>Manage influencer codes & discount campaigns</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D06F)', color: '#0B0B0B' }}
        >
          <Plus size={15} />
          New Code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Tag, label: 'Total Codes', value: codes.length, color: '#8B5CF6' },
          { icon: Users, label: 'Total Uses', value: totalUses, color: '#3B82F6' },
          { icon: TrendingUp, label: 'Revenue via Codes', value: `₹${totalRevenue.toFixed(0)}`, color: '#10B981' },
          { icon: DollarSign, label: 'Commission Owed', value: `₹${totalCommission.toFixed(0)}`, color: '#F59E0B' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl p-4 border"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <Icon size={16} color={color} className="mb-2" />
            <div className="text-lg font-black">{value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#52525B' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
              {['Code', 'Influencer', 'Discount', 'Commission', 'Uses', 'Revenue', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold tracking-wider uppercase" style={{ color: '#71717A' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12" style={{ color: '#52525B' }}>Loading…</td></tr>
            ) : codes.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12" style={{ color: '#52525B' }}>No promo codes yet. Create one!</td></tr>
            ) : codes.map(code => (
              <tr key={code.id} className="border-b transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm" style={{ color: '#E9C349' }}>{code.code}</span>
                    <button onClick={() => copyCode(code.code, code.id)} className="opacity-50 hover:opacity-100">
                      {copiedId === code.id ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: '#A1A1AA' }}>{code.influencer_name || '—'}</td>
                <td className="px-4 py-3 font-semibold">
                  {code.discount_type === 'percentage' ? `${code.discount_value}%` : `₹${code.discount_value}`}
                </td>
                <td className="px-4 py-3" style={{ color: '#F59E0B' }}>{code.commission_pct}%</td>
                <td className="px-4 py-3">
                  {code.used_count}
                  {code.usage_limit ? <span style={{ color: '#52525B' }}>/{code.usage_limit}</span> : ''}
                </td>
                <td className="px-4 py-3" style={{ color: '#10B981' }}>₹{code.total_revenue.toFixed(0)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(code)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: code.active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: code.active ? '#10B981' : '#EF4444',
                    }}>
                    {code.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(code)} className="opacity-60 hover:opacity-100">
                      <Pencil size={14} />
                    </button>
                    {deleteConfirm === code.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteCode(code.id)} className="text-red-500 hover:text-red-400">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="opacity-60 hover:opacity-100">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(code.id)} className="opacity-60 hover:opacity-100 text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl border p-6 space-y-4"
            style={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{editing ? 'Edit Promo Code' : 'New Promo Code'}</h2>
              <button onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="field-label">Code *</label>
                <input className="field-input" value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. PRIYA20" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="field-label">Influencer Name</label>
                <input className="field-input" value={form.influencer_name || ''}
                  onChange={e => setForm(f => ({ ...f, influencer_name: e.target.value }))}
                  placeholder="e.g. Priya Sharma" />
              </div>
              <div>
                <label className="field-label">Discount Type</label>
                <select className="field-input" value={form.discount_type}
                  onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as any }))}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="field-label">Discount Value *</label>
                <input type="number" min="0" className="field-input" value={form.discount_value}
                  onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="field-label">Commission % (influencer earns)</label>
                <input type="number" min="0" max="100" className="field-input" value={form.commission_pct}
                  onChange={e => setForm(f => ({ ...f, commission_pct: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="field-label">Usage Limit (blank = unlimited)</label>
                <input type="number" min="1" className="field-input"
                  value={form.usage_limit ?? ''}
                  onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div className="col-span-2">
                <label className="field-label">Expires At (optional)</label>
                <input type="datetime-local" className="field-input" value={form.expires_at || ''}
                  onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 accent-yellow-400" />
                <label htmlFor="active" className="text-sm" style={{ color: '#A1A1AA' }}>Active</label>
              </div>
            </div>

            {error && <div className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#F87171' }}>{error}</div>}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm border font-medium"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#A1A1AA' }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D06F)', color: '#0B0B0B' }}>
                {saving ? 'Saving…' : editing ? 'Update Code' : 'Create Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .field-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #71717A; margin-bottom: 6px; }
        .field-input { width: 100%; padding: 10px 12px; border-radius: 10px; font-size: 14px; outline: none; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #FAFAFA; }
        .field-input::placeholder { color: #52525B; }
      `}</style>
    </div>
  );
}
