"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Globe, Bell, Lock, Store, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // site_config fields
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [trustedCount, setTrustedCount] = useState('5000');
  const [marqueeEnabled, setMarqueeEnabled] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabaseAdmin.from('site_config').select('key, value');
    const cfg: Record<string, any> = {};
    (data || []).forEach((row: any) => { cfg[row.key] = row.value; });

    setWhatsappNumber(cfg['whatsapp_number'] || '917000000000');
    setTrustedCount(String(cfg['trusted_customers_count'] || '5000'));
    setMarqueeEnabled(cfg['marquee_enabled'] !== false);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    setError('');
    const now = new Date().toISOString();

    const upserts = [
      { key: 'whatsapp_number', value: whatsappNumber, updated_at: now },
      { key: 'trusted_customers_count', value: Number(trustedCount), updated_at: now },
      { key: 'marquee_enabled', value: marqueeEnabled, updated_at: now },
    ];

    const { error: err } = await supabaseAdmin.from('site_config').upsert(upserts, { onConflict: 'key' });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-light tracking-tight" style={{ color: '#FAFAFA' }}>Settings</h2>
          <p className="text-sm mt-1" style={{ color: '#52525B' }}>Manage store preferences · synced with Supabase</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border disabled:opacity-40"
          style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#71717A' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="max-w-2xl mb-4 px-4 py-2.5 rounded-lg text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
          {error}
        </div>
      )}

      <div className="max-w-2xl space-y-4">
        {/* Store */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <Store size={15} style={{ color: '#D4AF37' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Store Configuration</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#71717A' }}>WhatsApp Number (with country code)</label>
              <input className="dark-input w-full px-3 py-2.5 text-sm" placeholder="917000000000"
                value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} />
              <p className="text-xs mt-1.5" style={{ color: '#3F3F46' }}>Used for the floating WhatsApp button on the storefront</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#71717A' }}>Trusted Customers Count (Social Proof)</label>
              <input type="number" className="dark-input w-full px-3 py-2.5 text-sm" placeholder="5000"
                value={trustedCount} onChange={e => setTrustedCount(e.target.value)} />
              <p className="text-xs mt-1.5" style={{ color: '#3F3F46' }}>Shown as "Trusted by X+ customers" on the product page</p>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.1)' }}>
              <Bell size={15} style={{ color: '#EAB308' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Announcement Marquee</h3>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>Enable Top Marquee Banner</p>
              <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>
                Toggle the scrolling announcement bar on the storefront. Manage text in{' '}
                <a href="/admin/announcements" className="underline" style={{ color: '#D4AF37' }}>Announcements</a>.
              </p>
            </div>
            <button
              onClick={() => setMarqueeEnabled(v => !v)}
              className="ml-4 text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
              style={marqueeEnabled
                ? { background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }
                : { background: 'rgba(255,255,255,0.04)', color: '#52525B', border: '1px solid rgba(255,255,255,0.08)' }
              }>
              {marqueeEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Integrations */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.1)' }}>
              <Globe size={15} style={{ color: '#60A5FA' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Integrations</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Supabase', status: 'Connected', color: '#4ADE80' },
              { label: 'Razorpay / PhonePe', status: 'Connected', color: '#4ADE80' },
              { label: 'Shiprocket', status: 'Connected', color: '#4ADE80' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs" style={{ color: item.color }}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Access info */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <Lock size={15} style={{ color: '#F87171' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Admin Access</h3>
          </div>
          <div className="p-4 rounded-xl text-sm space-y-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#71717A' }}>
            <p>Authentication is powered by <strong style={{ color: '#A1A1AA' }}>Supabase Auth</strong>.</p>
            <p>To grant admin access to a user, run this in Supabase SQL editor:</p>
            <code className="block px-3 py-2 rounded-lg text-xs font-mono mt-2"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#D4AF37' }}>
              UPDATE profiles SET role = 'admin' WHERE email = 'you@email.com';
            </code>
            <p className="text-xs mt-2" style={{ color: '#3F3F46' }}>
              Remove <code style={{ color: '#A1A1AA' }}>ADMIN_AUTH_DISABLED=true</code> from .env.local when ready to enforce auth.
            </p>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={saving || loading}
            className="gold-btn px-8 py-2.5 text-sm disabled:opacity-60">
            {saving ? 'Saving…' : saved ? '✓ Saved to Supabase' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
