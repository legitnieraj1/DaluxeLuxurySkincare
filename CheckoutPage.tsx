import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Platform, Animated, ActivityIndicator, Image,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ShoppingBag, MapPin, User, Lock, Check } from 'lucide-react-native';

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
  priceDisplay: string;
  sizeDetail: string;
}

interface CheckoutPageProps {
  items: CheckoutItem[];
  onBack: () => void;
  onSuccess: (paymentId: string) => void;
  razorpayKeyId?: string;
}

const GOLD = '#C9A227';
const GOLD_LIGHT = '#E9C349';
const TEXT = '#1A1A1A';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Step = 'details' | 'review' | 'payment';

export default function CheckoutPage({ items, onBack, onSuccess, razorpayKeyId }: CheckoutPageProps) {
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [shipping, setShipping] = useState<number | 'CALCULATING'>(99);
  const [paymentMethod, setPaymentMethod] = useState<'prepaid' | 'cod'>('prepaid');
  const [pincodeError, setPincodeError] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    address: '', city: '', pincode: '', state: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const getShippingAmount = () => (shipping === 'CALCULATING' ? 0 : shipping);
  const displayShipping = shipping === 'CALCULATING' ? '...' : (shipping === 0 ? 'FREE' : `₹${shipping}`);
  const grandTotal = total + getShippingAmount();
  const API_URL = (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) || 'http://localhost:3000';

  async function checkShipping(pincode: string) {
    if (!pincode || pincode.length < 6) return;
    setShipping('CALCULATING');
    setPincodeError('');
    try {
      const w = 0.5; // default weight 500g
      const res = await fetch(`${API_URL}/api/checkout/shipping?pincode=${pincode}&weight=${w}&payment=${paymentMethod}`).then(r => r.json());
      if (res.serviceable) {
        setShipping(res.rate);
      } else {
        setShipping(99); // Fallback
        setPincodeError('Pincode might be unserviceable via primary partners');
      }
    } catch(e) {
      setShipping(99); 
    }
  }

  function animateStep(next: Step) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(next);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) e.phone = 'Valid 10-digit number required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit pincode required';
    if (!form.state.trim()) e.state = 'State is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePayment() {
    setLoading(true);

    const orderPayload = {
      user_id: null, // Will hook into session later
      total_amount: grandTotal,
      email: form.email,
      shipping_address: {
        name: form.name, phone: form.phone,
        address_line1: form.address, address_line2: '',
        city: form.city, state: form.state, pincode: form.pincode
      }
    };
    
    const cartPayload = items.map(i => ({ product_id: i.id, name: i.name, quantity: i.quantity, price: i.price }));

    if (paymentMethod === 'cod') {
      try {
        const res = await fetch(`${API_URL}/api/checkout/cod`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderPayload, cartItems: cartPayload })
        });
        const data = await res.json();
        setLoading(false);
        if (data.success) {
          setPaymentDone(true);
          setTimeout(() => onSuccess(data.order.order_number), 2000);
        } else {
          alert('COD Creation failed: ' + (data.error || 'Unknown error'));
        }
      } catch (e: any) { setLoading(false); alert(e.message); }
      return;
    }

    if (Platform.OS === 'web') {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Failed to load Razorpay. Please check your connection.');
        setLoading(false); return;
      }
      const key = razorpayKeyId || (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_RAZORPAY_KEY_ID : '') || '';
      
      const options = {
        key, amount: grandTotal * 100, currency: 'INR', name: 'DALUXE',
        description: `${items.length} item${items.length > 1 ? 's' : ''}`,
        handler: async (res: any) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/checkout/verify`, {
              method: 'POST', headers:{'Content-Type': 'application/json'},
              body: JSON.stringify({
                razorpay_order_id: res.razorpay_order_id || 'LOCAL',
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature || 'LOCAL',
                orderPayload, cartItems: cartPayload
              })
            });
            const data = await verifyRes.json();
            setLoading(false);
            if (data.success) {
               setPaymentDone(true);
               setTimeout(() => onSuccess(data.order.order_number), 2000);
            } else { alert('Verification failed, but payment was deducted. Please contact support.'); }
          } catch(e) { setLoading(false); alert('System error verifying payment.'); }
        },
        prefill: { name: form.name, email: form.email, contact: '91' + form.phone },
        notes: { address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}` },
        theme: { color: GOLD },
        modal: { ondismiss: () => setLoading(false) },
      };
      try { const rzp = new (window as any).Razorpay(options); rzp.open(); }
      catch (err) { setLoading(false); alert('Could not open payment window.'); }
    } else {
       setLoading(false); alert('Native payments not implemented in this snippet for brevity');
    }
  }

  // ─── Success screen ───────────────────────────────────────────────
  if (paymentDone) {
    return (
      <View style={s.successContainer}>
        <LinearGradient colors={['#FAF8F3', '#FFFDF9']} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={[GOLD, GOLD_LIGHT]} style={s.successCircle}>
          <Check color="#fff" size={36} strokeWidth={3} />
        </LinearGradient>
        <Text style={s.successTitle}>Order Confirmed!</Text>
        <Text style={s.successSub}>
          Thank you, {form.name.split(' ')[0]}! Your order is on its way to {form.city} in 3–5 business days.
        </Text>
        <View style={s.successPill}>
          <Text style={s.successPillText}>
            ₹{grandTotal.toLocaleString('en-IN')} · {items.length} item{items.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    );
  }

  // ─── Step indicator ───────────────────────────────────────────────
  const stepDone = (t: Step) =>
    (t === 'details' && (step === 'review' || step === 'payment')) ||
    (t === 'review' && step === 'payment');

  return (
    // KeyboardAvoidingView fixes inputs being covered by soft keyboard
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#FAF8F3', '#FFFDF9']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={s.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ChevronLeft color={TEXT} size={22} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Checkout</Text>
        <View style={s.lockBadge}>
          <Lock color={GOLD} size={11} />
          <Text style={s.lockText}>Secure</Text>
        </View>
      </View>

      {/* Steps */}
      <View style={s.steps}>
        {(['details', 'review', 'payment'] as Step[]).map((t, i) => (
          <View key={t} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[s.dot, step === t && s.dotActive, stepDone(t) && s.dotDone]}>
              {stepDone(t)
                ? <Check color="#fff" size={12} strokeWidth={3} />
                : <Text style={[s.dotNum, (step === t || stepDone(t)) && { color: '#fff' }]}>{i + 1}</Text>
              }
            </View>
            <Text style={[s.dotLabel, step === t && s.dotLabelActive]}>
              {t === 'details' ? 'You' : t === 'review' ? 'Review' : 'Pay'}
            </Text>
            {i < 2 && <View style={s.stepLine} />}
          </View>
        ))}
      </View>

      {/* Scrollable Body */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
        >
          <View style={s.body}>

            {/* ── STEP 1: DETAILS ── */}
            {step === 'details' && <>
              <SectionHead icon={User} label="Personal Details" />
              <Field label="Full Name" value={form.name} error={errors.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Ananya Sharma" autoComplete="name" textContentType="name" />
              <Field label="Mobile Number" value={form.phone} error={errors.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="9876543210" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
              <Field label="Email Address" value={form.email} error={errors.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />

              <View style={s.divider} />
              <SectionHead icon={MapPin} label="Delivery Address" />
              <Field label="Flat / House, Street, Area" value={form.address} error={errors.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="12 Rose Garden, Sector 21" multiline numberOfLines={2} autoComplete="street-address" textContentType="fullStreetAddress" />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}><Field label="City" value={form.city} error={errors.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="Mumbai" autoComplete="address-level2" textContentType="addressCity" /></View>
                <View style={{ flex: 1 }}><Field label="Pincode" value={form.pincode} error={errors.pincode || pincodeError} onChange={v => {
                    setForm(f => ({ ...f, pincode: v }));
                    if (v.length === 6) checkShipping(v);
                  }} onBlur={() => checkShipping(form.pincode)} placeholder="400001" keyboardType="numeric" autoComplete="postal-code" textContentType="postalCode" /></View>
              </View>
              <Field label="State" value={form.state} error={errors.state} onChange={v => setForm(f => ({ ...f, state: v }))} placeholder="Maharashtra" autoComplete="address-level1" textContentType="addressState" />

              <GoldButton label={shipping === 'CALCULATING' ? 'CALCULATING SHIPPING...' : 'REVIEW ORDER →'} disabled={shipping === 'CALCULATING'} onPress={() => { if (validate()) animateStep('review'); }} />
            </>}

            {/* ── STEP 2: REVIEW ── */}
            {step === 'review' && <>
              <SectionHead icon={ShoppingBag} label="Order Summary" />
              {items.map(item => (
                <View key={item.id} style={s.reviewRow}>
                  <View style={s.reviewImgBox}>
                    <Image source={item.image} style={s.reviewImg} resizeMode="contain" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.reviewName}>{item.name}</Text>
                    <Text style={s.reviewSub}>{item.sizeDetail} · Qty {item.quantity}</Text>
                  </View>
                  <Text style={s.reviewPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
                </View>
              ))}

              <View style={s.priceBox}>
                <PriceLine label="Subtotal" value={`₹${total.toLocaleString('en-IN')}`} />
                <PriceLine label="Shipping" value={displayShipping} green={shipping === 0} />
                <View style={s.divider} />
                <PriceLine label="Total Payable" value={`₹${grandTotal.toLocaleString('en-IN')}`} bold />
              </View>

              <View style={s.addrBox}>
                <MapPin color={GOLD} size={15} strokeWidth={1.5} style={{ marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.addrName}>{form.name} · +91{form.phone}</Text>
                  <Text style={s.addrText}>{form.address}, {form.city}, {form.state} – {form.pincode}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
                <TouchableOpacity onPress={() => animateStep('details')} style={s.ghostBtn} activeOpacity={0.7}>
                  <Text style={s.ghostBtnText}>← Edit</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <GoldButton label="PROCEED TO PAY →" onPress={() => animateStep('payment')} />
                </View>
              </View>
            </>}

            {/* ── STEP 3: PAYMENT ── */}
            {step === 'payment' && <>
              <View style={s.payCard}>
                <LinearGradient colors={['rgba(201,162,39,0.07)', 'rgba(233,195,73,0.03)']} style={s.payCardInner}>
                  <Text style={s.payAmount}>₹{grandTotal.toLocaleString('en-IN')}</Text>
                  <Text style={s.payLabel}>Total Payable</Text>
                  <View style={s.payPill}>
                    <Text style={s.payPillText}>{items.length} item{items.length > 1 ? 's' : ''} · Delivered to {form.city}</Text>
                  </View>
                </LinearGradient>
              </View>

              <SectionHead icon={ShoppingBag} label="Payment Method" />
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <TouchableOpacity onPress={() => { setPaymentMethod('prepaid'); checkShipping(form.pincode); }} style={[s.paymentToggle, paymentMethod === 'prepaid' && s.paymentToggleActive]} activeOpacity={0.8}>
                  {paymentMethod === 'prepaid' && <View style={s.paymentToggleDot} />}
                  <Text style={[s.paymentToggleText, paymentMethod === 'prepaid' && s.paymentToggleTextActive]}>Razorpay / Cards</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setPaymentMethod('cod'); checkShipping(form.pincode); }} style={[s.paymentToggle, paymentMethod === 'cod' && s.paymentToggleActive]} activeOpacity={0.8}>
                  {paymentMethod === 'cod' && <View style={s.paymentToggleDot} />}
                  <Text style={[s.paymentToggleText, paymentMethod === 'cod' && s.paymentToggleTextActive]}>Cash on Delivery</Text>
                </TouchableOpacity>
              </View>

              <View style={s.secureRow}>
                <Lock color={GOLD} size={13} />
                <Text style={s.secureText}>
                  {paymentMethod === 'prepaid' 
                    ? '100% secure payment powered by Razorpay. Your card details are never stored.'
                    : 'Pay physically with cash or UPI at the time of delivery to your doorstep.'}
                </Text>
              </View>

              <GoldButton label={loading ? '' : paymentMethod === 'cod' ? `PLACE ORDER (COD)` : `PAY ₹${grandTotal.toLocaleString('en-IN')}`} onPress={handlePayment} disabled={loading}
                loading={loading} />

              <TouchableOpacity onPress={() => animateStep('review')} style={{ alignItems: 'center', marginTop: 16, paddingVertical: 8 }} activeOpacity={0.7}>
                <Text style={s.ghostBtnText}>← Back to Review</Text>
              </TouchableOpacity>
            </>}

            <View style={{ height: 60 }} />
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

function SectionHead({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      <Icon color={GOLD} size={15} strokeWidth={2} />
      <Text style={{ fontSize: 12, fontWeight: '700', color: TEXT, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

function Field({ label, value, onChange, onBlur: customOnBlur, placeholder, error, multiline, keyboardType, numberOfLines, autoCapitalize, autoComplete, textContentType }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={[f.input, focused && f.focused, error && f.errBorder, multiline && { height: 72, textAlignVertical: 'top', paddingTop: 12 }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(26,26,26,0.28)"
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'words'}
        autoComplete={autoComplete as any}
        textContentType={textContentType as any}
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); if (customOnBlur) customOnBlur(); }}
      />
      {error && <Text style={f.err}>{error}</Text>}
    </View>
  );
}

function GoldButton({ label, onPress, disabled, loading }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} style={{ marginTop: 24, borderRadius: 14, overflow: 'hidden' }}>
      <LinearGradient colors={[GOLD, GOLD_LIGHT, GOLD]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ paddingVertical: 17, alignItems: 'center', borderRadius: 14, opacity: disabled ? 0.75 : 1,
          ...Platform.select({ web: { boxShadow: '0 6px 20px rgba(201,162,39,0.28)' } as any }) }}>
        {loading
          ? <ActivityIndicator color="#1A1A1A" size="small" />
          : <Text style={{ color: '#1A1A1A', fontSize: 13, fontWeight: '800', letterSpacing: 2 }}>{label}</Text>
        }
      </LinearGradient>
    </TouchableOpacity>
  );
}

function PriceLine({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 }}>
      <Text style={{ fontSize: bold ? 15 : 13, color: bold ? TEXT : 'rgba(26,26,26,0.55)', fontWeight: bold ? '700' : '400' }}>{label}</Text>
      <Text style={{ fontSize: bold ? 16 : 13, color: green ? '#2D7A2D' : bold ? TEXT : TEXT, fontWeight: bold ? '800' : '600' }}>{value}</Text>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F3' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 52 : Platform.OS === 'web' ? 24 : 20,
    paddingBottom: 16, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT, letterSpacing: 0.8 },
  lockBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(201,162,39,0.08)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(201,162,39,0.18)',
  },
  lockText: { fontSize: 11, color: GOLD, fontWeight: '600' },

  steps: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, paddingHorizontal: 24,
  },
  dot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)',
  },
  dotActive: { backgroundColor: GOLD, borderColor: GOLD },
  dotDone: { backgroundColor: '#3C7A3C', borderColor: '#3C7A3C' },
  dotNum: { fontSize: 11, fontWeight: '700', color: 'rgba(26,26,26,0.3)' },
  dotLabel: { fontSize: 11, color: 'rgba(26,26,26,0.35)', fontWeight: '500', marginLeft: 6 },
  dotLabelActive: { color: GOLD, fontWeight: '700' },
  stepLine: { width: 24, height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginHorizontal: 8 },

  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  body: { maxWidth: 560, alignSelf: 'center', width: '100%', padding: 24 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: 20 },

  // Review
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  reviewImgBox: { width: 62, height: 62, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  reviewImg: { width: 52, height: 52 },
  reviewName: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 3 },
  reviewSub: { fontSize: 11, color: 'rgba(26,26,26,0.45)' },
  reviewPrice: { fontSize: 15, fontWeight: '700', color: TEXT },
  priceBox: { marginTop: 18, padding: 18, backgroundColor: 'rgba(0,0,0,0.025)', borderRadius: 14, gap: 8 },
  addrBox: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 16,
    padding: 16, backgroundColor: 'rgba(201,162,39,0.05)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(201,162,39,0.14)',
  },
  addrName: { fontSize: 13, fontWeight: '600', color: TEXT, marginBottom: 4 },
  addrText: { fontSize: 12, color: 'rgba(26,26,26,0.55)', lineHeight: 19 },

  ghostBtn: { paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  ghostBtnText: { color: GOLD, fontSize: 13, fontWeight: '600' },

  // Payment
  payCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(201,162,39,0.2)', marginBottom: 20 },
  payCardInner: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  payAmount: { fontSize: 44, fontWeight: '300', color: TEXT, letterSpacing: -1, ...Platform.select({ web: { fontFamily: 'Georgia, serif' } as any }) },
  payLabel: { fontSize: 11, color: 'rgba(26,26,26,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8 },
  payPill: { marginTop: 16, paddingHorizontal: 18, paddingVertical: 7, backgroundColor: 'rgba(201,162,39,0.09)', borderRadius: 20 },
  payPillText: { fontSize: 12, color: GOLD, fontWeight: '600' },
  secureRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 14, backgroundColor: 'rgba(0,0,0,0.025)', borderRadius: 12, marginBottom: 4 },
  secureText: { flex: 1, fontSize: 12, color: 'rgba(26,26,26,0.45)', lineHeight: 18 },

  // Success
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  successTitle: { fontSize: 26, fontWeight: '300', color: TEXT, marginBottom: 12, textAlign: 'center', ...Platform.select({ web: { fontFamily: 'Georgia, serif' } as any }) },
  successSub: { fontSize: 14, color: 'rgba(26,26,26,0.55)', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  successPill: { paddingHorizontal: 22, paddingVertical: 10, backgroundColor: 'rgba(201,162,39,0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(201,162,39,0.2)' },
  successPillText: { fontSize: 14, fontWeight: '700', color: GOLD },
  paymentToggle: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  paymentToggleActive: { borderColor: GOLD, backgroundColor: 'rgba(201,162,39,0.05)' },
  paymentToggleText: { fontSize: 13, color: 'rgba(26,26,26,0.5)', fontWeight: '600' },
  paymentToggleTextActive: { color: TEXT, fontWeight: '700' },
  paymentToggleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD },
});

const f = StyleSheet.create({
  label: { fontSize: 10, fontWeight: '700', color: 'rgba(26,26,26,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 7 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: TEXT,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  focused: {
    borderColor: GOLD,
    ...Platform.select({ web: { boxShadow: '0 0 0 3px rgba(201,162,39,0.1)' } as any }),
  },
  errBorder: { borderColor: '#E53E3E' },
  err: { fontSize: 11, color: '#E53E3E', marginTop: 4, marginLeft: 2 },
});
