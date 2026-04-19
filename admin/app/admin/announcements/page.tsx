"use client";
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Plus, Trash2, GripVertical, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';

interface Announcement {
  id: string;
  text: string;
  active: boolean;
  sort_order: number;
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);
  const [marqueeEnabled, setMarqueeEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: ann }, { data: cfg }] = await Promise.all([
      supabaseAdmin.from('announcements').select('*').order('sort_order'),
      supabaseAdmin.from('site_config').select('value').eq('key', 'marquee_enabled').single(),
    ]);
    setItems(ann || []);
    if (cfg) setMarqueeEnabled(cfg.value !== false && cfg.value !== 'false');
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function add() {
    if (!newText.trim()) return;
    setAdding(true);
    setAddError('');
    const maxOrder = items.reduce((m, i) => Math.max(m, i.sort_order), 0);
    const { error } = await supabaseAdmin
      .from('announcements')
      .insert({ text: newText.trim(), active: true, sort_order: maxOrder + 1 });
    if (error) {
      setAddError(`Failed to save: ${error.message}`);
      setAdding(false);
      return;
    }
    setNewText('');
    setAdding(false);
    load();
  }

  async function toggle(item: Announcement) {
    await supabaseAdmin.from('announcements').update({ active: !item.active }).eq('id', item.id);
    load();
  }

  async function deleteItem(id: string) {
    await supabaseAdmin.from('announcements').delete().eq('id', id);
    setDeleteConfirm(null);
    load();
  }

  async function toggleMarquee() {
    const next = !marqueeEnabled;
    setMarqueeEnabled(next);
    await supabaseAdmin.from('site_config').upsert({ key: 'marquee_enabled', value: next }, { onConflict: 'key' });
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6" style={{ backgroundColor: '#0B0B0B', color: '#FAFAFA' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-wide">Announcement Marquee</h1>
          <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>Manage scrolling text shown on the storefront</p>
        </div>
        <button
          onClick={toggleMarquee}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border"
          style={{
            borderColor: marqueeEnabled ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)',
            color: marqueeEnabled ? '#10B981' : '#71717A',
            backgroundColor: marqueeEnabled ? 'rgba(16,185,129,0.08)' : 'transparent',
          }}
        >
          {marqueeEnabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          {marqueeEnabled ? 'Marquee ON' : 'Marquee OFF'}
        </button>
      </div>

      {addError && (
        <div className="px-4 py-2.5 rounded-lg text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
          {addError}
        </div>
      )}

      {/* Add new */}
      <div className="flex gap-3">
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="e.g. Free shipping on orders above ₹499"
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA' }}
        />
        <button
          onClick={add}
          disabled={adding || !newText.trim()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D06F)', color: '#0B0B0B' }}
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {loading ? (
          <div className="text-center py-12" style={{ color: '#52525B' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#52525B' }}>
            No announcements yet. Using default product labels.
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <div key={item.id}
                className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <GripVertical size={14} color="#3F3F46" />
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.active ? '#10B981' : '#3F3F46' }}
                />
                <span className="flex-1 text-sm" style={{ color: item.active ? '#FAFAFA' : '#71717A' }}>
                  {item.text}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(item)}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: item.active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                      color: item.active ? '#10B981' : '#71717A',
                    }}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </button>
                  {deleteConfirm === item.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deleteItem(item.id)} className="text-red-500"><Check size={14} /></button>
                      <button onClick={() => setDeleteConfirm(null)} style={{ color: '#71717A' }}><X size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(item.id)} className="text-red-500 opacity-60 hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs" style={{ color: '#3F3F46' }}>
        Tip: Changes reflect on the storefront within seconds. Reordering via drag coming soon.
      </p>
    </div>
  );
}
