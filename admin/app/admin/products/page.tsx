"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, X, Search, RefreshCw, ToggleLeft, ToggleRight, Upload } from 'lucide-react';

const REGIMEN_STEPS = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Treatment', 'Mask'];

function getStockBadge(qty: number) {
  if (qty <= 0) return { label: 'Out of Stock', cls: 'badge-outofstock' };
  if (qty <= 10) return { label: 'Low Stock', cls: 'badge-low' };
  return { label: 'In Stock', cls: 'badge-instock' };
}

interface Product {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  discount_pct: number | null;
  stock_quantity: number;
  active: boolean;
  ingredients: string[];
  skin_concerns: string[];
  regimen_step: string | null;
  weight_grams: number;
  volume_ml: number;
  image_url: string | null;
  offer_ends_at: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  price: '' as string | number,
  original_price: '' as string | number,
  discount_pct: '' as string | number,
  stock_quantity: '' as string | number,
  active: true,
  ingredients: [''],
  skin_concerns: [''],
  regimen_step: 'Serum',
  weight_grams: '' as string | number,
  volume_ml: '' as string | number,
  image_url: '',
  offer_ends_at: '',
};

// ─── Product Modal ────────────────────────────────────────────────────────────

function ProductModal({
  product, onClose, onSaved,
}: { product?: Product; onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState(product ? {
    name: product.name,
    slug: product.slug || '',
    description: product.description || '',
    price: product.price,
    original_price: product.original_price ?? '',
    discount_pct: product.discount_pct ?? '',
    stock_quantity: product.stock_quantity,
    active: product.active,
    ingredients: product.ingredients?.length ? product.ingredients : [''],
    skin_concerns: product.skin_concerns?.length ? product.skin_concerns : [''],
    regimen_step: product.regimen_step || 'Serum',
    weight_grams: product.weight_grams || '',
    volume_ml: product.volume_ml || '',
    image_url: product.image_url || '',
    offer_ends_at: product.offer_ends_at ? product.offer_ends_at.slice(0, 16) : '',
  } : { ...EMPTY_FORM });

  const steps = ['Basic Info', 'Pricing & Stock', 'Details', 'Media'];

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `products/${Date.now()}.${ext}`;
    const { data, error } = await supabaseAdmin.storage.from('product-images').upload(path, file, { upsert: true });
    if (error) { setError('Image upload failed: ' + error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);
    setForm(f => ({ ...f, image_url: publicUrl }));
    setUploading(false);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Product name is required'); setStep(0); return; }
    if (!form.price || Number(form.price) <= 0) { setError('Valid price is required'); setStep(1); return; }
    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim() || null,
      price: Number(form.price),
      original_price: form.original_price !== '' ? Number(form.original_price) : null,
      discount_pct: form.discount_pct !== '' ? Number(form.discount_pct) : null,
      stock_quantity: Number(form.stock_quantity) || 0,
      active: form.active,
      ingredients: form.ingredients.filter(i => i.trim()),
      skin_concerns: form.skin_concerns.filter(s => s.trim()),
      regimen_step: form.regimen_step,
      weight_grams: Number(form.weight_grams) || 0,
      volume_ml: Number(form.volume_ml) || 0,
      image_url: form.image_url.trim() || null,
      offer_ends_at: form.offer_ends_at ? new Date(form.offer_ends_at).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    let err;
    if (product) {
      ({ error: err } = await supabaseAdmin.from('products').update(payload).eq('id', product.id));
    } else {
      ({ error: err } = await supabaseAdmin.from('products').insert(payload));
    }

    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{ border: '1px solid rgba(212,175,55,0.2)', background: '#111111' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h3 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>
              Step {step + 1} of {steps.length} — {steps[step]}
            </p>
          </div>
          <button onClick={onClose} className="ghost-btn p-2 rounded-lg"><X size={16} /></button>
        </div>

        {/* Step Tabs */}
        <div className="flex px-6 pt-4 gap-2 flex-wrap">
          {steps.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={step === i
                ? { background: 'linear-gradient(135deg,#D4AF37,#F5D06F)', color: '#0B0B0B', fontWeight: 700 }
                : { background: 'rgba(255,255,255,0.04)', color: '#52525B', border: '1px solid rgba(255,255,255,0.06)' }
              }>{s}</button>
          ))}
        </div>

        {error && (
          <div className="mx-6 mt-3 px-4 py-2.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
            {error}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* STEP 0: Basic Info */}
          {step === 0 && (
            <>
              <Field label="Product Name *">
                <input className="dark-input w-full px-3 py-2.5 text-sm" placeholder="e.g. Radiance Renewal Serum"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </Field>
              <Field label="Slug (URL-safe)">
                <input className="dark-input w-full px-3 py-2.5 text-sm" placeholder="radiance-renewal-serum"
                  value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </Field>
              <Field label="Description">
                <textarea rows={4} className="dark-input w-full px-3 py-2.5 text-sm resize-none"
                  placeholder="Detailed product description…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </Field>
              <Field label="Regimen Step">
                <select className="dark-input w-full px-3 py-2.5 text-sm"
                  value={form.regimen_step} onChange={e => setForm(f => ({ ...f, regimen_step: e.target.value }))}>
                  {REGIMEN_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>Active Product</p>
                  <p className="text-xs" style={{ color: '#52525B' }}>Visible on store</p>
                </div>
                <button onClick={() => setForm(f => ({ ...f, active: !f.active }))}>
                  {form.active
                    ? <ToggleRight size={28} style={{ color: '#D4AF37' }} />
                    : <ToggleLeft size={28} style={{ color: '#52525B' }} />}
                </button>
              </div>
            </>
          )}

          {/* STEP 1: Pricing & Stock */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Sale Price (₹) *">
                  <input type="number" className="dark-input w-full px-3 py-2.5 text-sm" placeholder="1299"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </Field>
                <Field label="Original Price (₹)">
                  <input type="number" className="dark-input w-full px-3 py-2.5 text-sm" placeholder="1599"
                    value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} />
                </Field>
                <Field label="Discount % (display)">
                  <input type="number" className="dark-input w-full px-3 py-2.5 text-sm" placeholder="20"
                    value={form.discount_pct} onChange={e => setForm(f => ({ ...f, discount_pct: e.target.value }))} />
                </Field>
                <Field label="Stock Quantity">
                  <input type="number" className="dark-input w-full px-3 py-2.5 text-sm" placeholder="100"
                    value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Weight (grams)">
                  <input type="number" className="dark-input w-full px-3 py-2.5 text-sm" placeholder="50"
                    value={form.weight_grams} onChange={e => setForm(f => ({ ...f, weight_grams: e.target.value }))} />
                </Field>
                <Field label="Volume (ml)">
                  <input type="number" className="dark-input w-full px-3 py-2.5 text-sm" placeholder="30"
                    value={form.volume_ml} onChange={e => setForm(f => ({ ...f, volume_ml: e.target.value }))} />
                </Field>
              </div>
              <Field label="Offer Ends At (countdown timer)">
                <input type="datetime-local" className="dark-input w-full px-3 py-2.5 text-sm"
                  value={form.offer_ends_at} onChange={e => setForm(f => ({ ...f, offer_ends_at: e.target.value }))} />
              </Field>
              {Number(form.stock_quantity) >= 0 && (
                <div className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-sm" style={{ color: '#A1A1AA' }}>Stock Status Preview</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStockBadge(Number(form.stock_quantity)).cls}`}>
                    {getStockBadge(Number(form.stock_quantity)).label}
                  </span>
                </div>
              )}
              {form.price && form.original_price && Number(form.original_price) > Number(form.price) && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)' }}>
                  <p className="text-xs" style={{ color: '#A1A1AA' }}>Computed Discount</p>
                  <p className="text-xl font-bold mt-1 gold-text">
                    {Math.round((1 - Number(form.price) / Number(form.original_price)) * 100)}% OFF
                  </p>
                </div>
              )}
            </>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <>
              <MultiInput label="Key Ingredients" values={form.ingredients}
                onChange={v => setForm(f => ({ ...f, ingredients: v }))} placeholder="e.g. Vitamin C" />
              <MultiInput label="Skin Concerns" values={form.skin_concerns}
                onChange={v => setForm(f => ({ ...f, skin_concerns: v }))} placeholder="e.g. Pigmentation" />
            </>
          )}

          {/* STEP 3: Media */}
          {step === 3 && (
            <>
              <Field label="Image URL">
                <input className="dark-input w-full px-3 py-2.5 text-sm" placeholder="https://…"
                  value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
              </Field>
              <div className="text-center text-xs py-1" style={{ color: '#52525B' }}>— or upload —</div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div onClick={() => fileRef.current?.click()}
                className="w-full h-28 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                style={{ border: '2px dashed rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.03)' }}>
                {uploading
                  ? <p className="text-xs" style={{ color: '#D4AF37' }}>Uploading…</p>
                  : <>
                    <Upload size={20} style={{ color: '#D4AF37' }} />
                    <p className="text-xs" style={{ color: '#71717A' }}>Click to upload to Supabase Storage</p>
                  </>
                }
              </div>
              {form.image_url && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src={form.image_url} alt="preview" className="w-full max-h-48 object-contain"
                    style={{ background: '#1A1A1A' }} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="ghost-btn px-4 py-2 text-sm disabled:opacity-30">Back</button>
          <div className="flex gap-2">
            {step < steps.length - 1
              ? <button onClick={() => setStep(s => s + 1)} className="gold-btn px-5 py-2 text-sm">Continue →</button>
              : <button onClick={handleSave} disabled={saving} className="gold-btn px-6 py-2 text-sm disabled:opacity-60">
                  {saving ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#A1A1AA' }}>{label}</label>
      {children}
    </div>
  );
}

function MultiInput({ label, values, onChange, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input className="dark-input flex-1 px-3 py-2 text-sm" placeholder={placeholder}
              value={v} onChange={e => { const n = [...values]; n[i] = e.target.value; onChange(n); }} />
            <button onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="ghost-btn px-2 rounded-lg"><X size={14} /></button>
          </div>
        ))}
        <button onClick={() => onChange([...values, ''])}
          className="ghost-btn text-xs px-3 py-1.5 rounded-lg w-full">+ Add</button>
      </div>
    </Field>
  );
}

// ─── Main Products Page ───────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'none' | 'add' | 'edit'>('none');
  const [editing, setEditing] = useState<Product | undefined>();
  const [search, setSearch] = useState('');
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!delConfirm) return;
    setDeleting(true);
    await supabaseAdmin.from('products').delete().eq('id', delConfirm);
    setDeleting(false);
    setDelConfirm(null);
    load();
  }

  async function toggleActive(p: Product) {
    setTogglingId(p.id);
    await supabaseAdmin.from('products').update({ active: !p.active, updated_at: new Date().toISOString() }).eq('id', p.id);
    setTogglingId(null);
    load();
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.regimen_step?.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Modals */}
      {(modal === 'add' || modal === 'edit') && (
        <ProductModal product={editing} onClose={() => { setModal('none'); setEditing(undefined); }} onSaved={load} />
      )}
      {delConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
          <div className="glass-card p-6 w-80" style={{ border: '1px solid rgba(248,113,113,0.2)', background: '#111111' }}>
            <h4 className="font-semibold mb-2" style={{ color: '#FAFAFA' }}>Delete Product?</h4>
            <p className="text-sm mb-5" style={{ color: '#71717A' }}>This cannot be undone. The product will be permanently removed from your catalog.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelConfirm(null)} className="ghost-btn flex-1 py-2 text-sm rounded-lg">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2 text-sm rounded-lg font-semibold disabled:opacity-60"
                style={{ background: '#EF4444', color: '#fff' }}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-light tracking-tight" style={{ color: '#FAFAFA' }}>Products</h2>
          <p className="text-sm mt-1" style={{ color: '#52525B' }}>{products.length} products in catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} disabled={loading} className="ghost-btn p-2 rounded-lg disabled:opacity-40">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setEditing(undefined); setModal('add'); }}
            className="gold-btn flex items-center gap-2 px-5 py-2.5 text-sm">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#52525B' }} />
          <input className="dark-input w-full pl-9 pr-3 py-2.5 text-sm" placeholder="Search products…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Product', 'Step', 'Price', 'Stock', 'Stock Status', 'Active', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: '#3F3F46' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-16 text-sm" style={{ color: '#52525B' }}>Loading products…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-sm" style={{ color: '#3F3F46' }}>No products found</td></tr>
            ) : filtered.map(p => {
              const badge = getStockBadge(p.stock_quantity);
              return (
                <tr key={p.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {/* Product Name + Image */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.12)' }}>
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          : <span className="text-xs font-bold gold-text">{p.name[0]}</span>
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: '#FAFAFA' }}>{p.name}</p>
                        {p.discount_pct && (
                          <p className="text-[10px] mt-0.5" style={{ color: '#4ADE80' }}>{p.discount_pct}% OFF</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Regimen Step */}
                  <td className="px-5 py-4 text-xs" style={{ color: '#71717A' }}>{p.regimen_step || '—'}</td>

                  {/* Price */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>₹{Number(p.price).toLocaleString()}</p>
                    {p.original_price && (
                      <p className="text-[10px] line-through" style={{ color: '#52525B' }}>₹{Number(p.original_price).toLocaleString()}</p>
                    )}
                  </td>

                  {/* Stock Qty */}
                  <td className="px-5 py-4 text-xs" style={{ color: '#71717A' }}>{p.stock_quantity} units</td>

                  {/* Stock Status badge */}
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>

                  {/* Active toggle */}
                  <td className="px-5 py-4">
                    <button onClick={() => toggleActive(p)} disabled={togglingId === p.id}>
                      {p.active
                        ? <ToggleRight size={24} style={{ color: '#D4AF37' }} />
                        : <ToggleLeft size={24} style={{ color: '#52525B' }} />
                      }
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => { setEditing(p); setModal('edit'); }}
                        className="ghost-btn p-2 rounded-lg" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDelConfirm(p.id)}
                        className="p-2 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#F87171' }}
                        title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
