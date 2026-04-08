import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, TextInput, Platform, Dimensions, ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, withDelay, Easing, interpolate, Extrapolation,
  FadeInDown, FadeInUp, FadeIn, SlideInRight, SlideOutLeft,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight, ArrowLeft, Check, Droplets, Sun, Moon, Upload,
  Camera, Mail, Download, X, Star, Sparkles, ChevronRight, ScanFace
} from 'lucide-react-native';

const { width: SW, height: SH } = Dimensions.get('window');
const isMob = SW < 768;

// ═══════════════════════════════════════
// DALUXE PALETTE
// ═══════════════════════════════════════
const GOLD       = '#D4AF37';
const GOLD_BRIGHT= '#F0CE5E';
const GOLD_DEEP  = '#8A6914';
const GOLD_GLOW  = 'rgba(212,175,55,0.15)';
const GOLD_BDR   = 'rgba(212,175,55,0.30)';
const BG         = '#FDFBF7';
const BG_ALT     = '#F4EFEA';
const CARD       = 'rgba(255,255,255,0.85)';
const DARK       = '#1A1A1A';
const DIM        = 'rgba(26,26,26,0.6)';
const MUTED      = 'rgba(26,26,26,0.35)';
const SERIF      = Platform.select({ web: '"Noto Serif", Georgia, serif', default: undefined });
const WEB        = (o: any) => Platform.select({ web: o as any }) as any;

// ═══════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════
const MOCK_RESULTS = {
  skinType: 'Combination',
  confidence: 87,
  concerns: [
    { label: 'Dullness', pct: 72, color: '#C9A227' },
    { label: 'Pigmentation', pct: 58, color: '#B8962E' },
    { label: 'Acne', pct: 40, color: '#8A5A19' },
    { label: 'Dark Spots', pct: 35, color: '#A07828' },
  ],
  morningRoutine: ['Gold Glow Face Wash', 'Ultra Sensitive Serum', 'Hydrating Moisturiser', 'SPF 50 Sunscreen'],
  nightRoutine:   ['Gold Glow Face Wash', 'Repair Night Cream', 'Rosehip Oil'],
  products: [
    { id: 1, name: 'GOLD GLOW\nFACE WASH', price: '₹299', img: require('./assets/facewashproductcard.png') },
    { id: 2, name: 'ULTRA SENSITIVE\nFACE SERUM',  price: '₹449', img: require('./assets/faceserumproductcard.png') },
    { id: 3, name: 'REPAIR NIGHT\nCREAM',          price: '₹399', img: require('./assets/night cream product cARD.png') },
  ],
};

// ═══════════════════════════════════════
// REUSABLE ATOMS
// ═══════════════════════════════════════
const GoldBtn = ({ label, onPress, icon, disabled, size = 'md' }: any) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}
    style={{ opacity: disabled ? 0.45 : 1, borderRadius: 40, overflow: 'hidden',
      shadowColor: GOLD, shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }}>
    <LinearGradient colors={['#FFF1B9', '#D4AF37', '#8A5A19']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: size === 'lg' ? 18 : 13, paddingHorizontal: size === 'lg' ? 40 : 28 }}>
      <Text style={{ color: '#1A1A1A', fontWeight: '700', fontSize: size === 'lg' ? 15 : 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</Text>
      {icon && React.createElement(icon, { color: '#1A1A1A', size: 16 })}
    </LinearGradient>
  </TouchableOpacity>
);

const GhostBtn = ({ label, onPress, icon }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.75}
    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 13, paddingHorizontal: 24,
      borderRadius: 40, borderWidth: 1, borderColor: GOLD_BDR, backgroundColor: 'rgba(212,175,55,0.05)' }}>
    {icon && React.createElement(icon, { color: GOLD, size: 16 })}
    <Text style={{ color: GOLD, fontWeight: '600', fontSize: 13, letterSpacing: 1 }}>{label}</Text>
  </TouchableOpacity>
);

const GoldDivider = ({ width: w = 60 }: { width?: number }) => (
  <View style={{ alignItems: 'center', marginVertical: 12 }}>
    <LinearGradient colors={['transparent', GOLD, 'transparent']}
      start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
      style={{ width: w, height: 1 }} />
  </View>
);

// ═══════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════
const ProgressBar = ({ step, total }: { step: number; total: number }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(step / total, { duration: 500, easing: Easing.out(Easing.ease) });
  }, [step]);
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` as any }));

  return (
    <View style={{ paddingHorizontal: isMob ? 20 : 40, paddingVertical: 14, backgroundColor: BG,
      borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: MUTED, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Step {step} of {total}</Text>
        <Text style={{ color: GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>{Math.round(step / total * 100)}%</Text>
      </View>
      <View style={{ height: 4, backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 4, overflow: 'hidden' }}>
        <Animated.View style={[{ height: '100%', borderRadius: 4 }, barStyle]}>
          <LinearGradient colors={['#FFF1B9', GOLD]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
        </Animated.View>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════
// STEP 1 — SKIN TYPE
// ═══════════════════════════════════════
const SKIN_TYPES = [
  { id: 'oily',        label: 'Oily',         desc: 'Shiny T-zone, prone to breakouts',    icon: '💧' },
  { id: 'dry',         label: 'Dry',          desc: 'Tight, flaky, or rough texture',       icon: '🏜️' },
  { id: 'combination', label: 'Combination',  desc: 'Oily T-zone, dry cheeks',              icon: '⚖️' },
  { id: 'sensitive',   label: 'Sensitive',    desc: 'Easily irritated or red',              icon: '🌸' },
  { id: 'unsure',      label: 'Not Sure',     desc: 'Let our AI figure it out',             icon: '✨' },
];

const Step1 = ({ value, onSelect }: any) => (
  <View>
    <Text style={s.stepTitle}>What's your skin type?</Text>
    <Text style={s.stepSub}>Select the option that best describes your skin on an average day</Text>
    <View style={{ gap: 12, marginTop: 8 }}>
      {SKIN_TYPES.map(t => (
        <TouchableOpacity key={t.id} onPress={() => onSelect(t.id)} activeOpacity={0.8}
          style={[s.optionCard, value === t.id && s.optionCardActive]}>
          <Text style={{ fontSize: 28 }}>{t.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.optionLabel, value === t.id && { color: GOLD }]}>{t.label}</Text>
            <Text style={s.optionDesc}>{t.desc}</Text>
          </View>
          {value === t.id && (
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center' }}>
              <Check color="#1A1A1A" size={13} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ═══════════════════════════════════════
// STEP 2 — CONCERNS
// ═══════════════════════════════════════
const CONCERNS_LIST = [
  { id: 'acne',       label: 'Acne',        icon: '🔴' },
  { id: 'darkspots',  label: 'Dark Spots',  icon: '🟤' },
  { id: 'pigment',    label: 'Pigmentation', icon: '🟡' },
  { id: 'dullness',   label: 'Dullness',    icon: '⬜' },
  { id: 'pores',      label: 'Large Pores', icon: '🔵' },
  { id: 'wrinkles',   label: 'Wrinkles',    icon: '〰️' },
  { id: 'redness',    label: 'Redness',     icon: '🌸' },
];

const Step2 = ({ value, onToggle }: any) => (
  <View>
    <Text style={s.stepTitle}>What concerns you most?</Text>
    <Text style={s.stepSub}>Select all that apply — our AI will prioritize these</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
      {CONCERNS_LIST.map(c => {
        const active = value.includes(c.id);
        return (
          <TouchableOpacity key={c.id} onPress={() => onToggle(c.id)} activeOpacity={0.8}
            style={[s.chip, active && s.chipActive]}>
            <Text style={{ fontSize: 16 }}>{c.icon}</Text>
            <Text style={[s.chipLabel, active && { color: '#1A1A1A' }]}>{c.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ═══════════════════════════════════════
// STEP 3 — LIFESTYLE
// ═══════════════════════════════════════
const LifestyleChip = ({ label, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}
    style={{ paddingVertical: 10, paddingHorizontal: 18, borderRadius: 24, borderWidth: 1,
      borderColor: active ? GOLD : 'rgba(212,175,55,0.25)',
      backgroundColor: active ? GOLD_GLOW : 'transparent' }}>
    <Text style={{ color: active ? GOLD : DIM, fontSize: 13, fontWeight: active ? '700' : '400' }}>{label}</Text>
  </TouchableOpacity>
);

const LifeSection = ({ title, options, selected, onSelect }: any) => (
  <View style={{ marginBottom: 28 }}>
    <Text style={{ color: DARK, fontSize: 14, fontWeight: '600', marginBottom: 12, letterSpacing: 0.5 }}>{title}</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o: string) => (
        <LifestyleChip key={o} label={o} active={selected === o} onPress={() => onSelect(o)} />
      ))}
    </View>
  </View>
);

const Step3 = ({ value, onChange }: any) => (
  <View>
    <Text style={s.stepTitle}>Your Lifestyle</Text>
    <Text style={s.stepSub}>These factors significantly shape your skin's health</Text>
    <View style={{ marginTop: 16 }}>
      <LifeSection title="💤  Hours of sleep per night"
        options={['< 5 hrs', '5–6 hrs', '7–8 hrs', '8+ hrs']}
        selected={value.sleep} onSelect={(v: string) => onChange({ ...value, sleep: v })} />
      <LifeSection title="💧  Daily water intake"
        options={['< 1L', '1–2L', '2–3L', '3L+']}
        selected={value.water} onSelect={(v: string) => onChange({ ...value, water: v })} />
      <LifeSection title="☀️  Sun exposure"
        options={['Minimal', 'Moderate', 'High', 'Extreme']}
        selected={value.sun} onSelect={(v: string) => onChange({ ...value, sun: v })} />
      <LifeSection title="🏙️  Environment"
        options={['City/Urban', 'Suburban', 'Rural', 'Coastal']}
        selected={value.env} onSelect={(v: string) => onChange({ ...value, env: v })} />
    </View>
  </View>
);

// ═══════════════════════════════════════
// STEP 4 — PHOTO UPLOAD
// ═══════════════════════════════════════
const Step4 = ({ onSkip }: any) => (
  <View>
    <Text style={s.stepTitle}>Skin Photo Analysis</Text>
    <Text style={s.stepSub}>Optional — Upload a selfie for AI visual skin detection</Text>
    <View style={[s.uploadBox, { marginTop: 20 }]}>
      <LinearGradient colors={[GOLD_GLOW, 'transparent']} style={StyleSheet.absoluteFillObject} />
      <ScanFace color={GOLD} size={44} />
      <Text style={{ color: DARK, fontSize: 16, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>Drag & drop your photo</Text>
      <Text style={{ color: DIM, fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>Or tap to upload — JPG, PNG (max 5MB){'\n'}No photo is stored or shared</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
        <GoldBtn label="Upload Photo" icon={Upload} />
        <GhostBtn label="Use Camera" icon={Camera} />
      </View>
    </View>
    <TouchableOpacity onPress={onSkip} style={{ marginTop: 18, alignItems: 'center' }}>
      <Text style={{ color: MUTED, fontSize: 13, textDecorationLine: 'underline' }}>Skip this step — I'll go without photo</Text>
    </TouchableOpacity>
  </View>
);

// ═══════════════════════════════════════
// STEP 5 — BASIC INFO
// ═══════════════════════════════════════
const Step5 = ({ value, onChange }: any) => (
  <View>
    <Text style={s.stepTitle}>Almost there! ✨</Text>
    <Text style={s.stepSub}>We'll personalize your report and send it straight to you</Text>
    <View style={{ gap: 16, marginTop: 20 }}>
      <View>
        <Text style={s.inputLabel}>Your Name</Text>
        <TextInput
          value={value.name} onChangeText={(v) => onChange({ ...value, name: v })}
          placeholder="e.g. Priya Sharma"
          placeholderTextColor={MUTED}
          style={s.input}
        />
      </View>
      <View>
        <Text style={s.inputLabel}>Email Address</Text>
        <TextInput
          value={value.email} onChangeText={(v) => onChange({ ...value, email: v })}
          placeholder="priya@email.com"
          placeholderTextColor={MUTED}
          keyboardType="email-address"
          autoCapitalize="none"
          style={s.input}
        />
      </View>
      <View style={{ padding: 16, borderRadius: 14, backgroundColor: GOLD_GLOW, borderWidth: 1, borderColor: GOLD_BDR, gap: 6 }}>
        <Text style={{ color: GOLD, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>🔒  Privacy Assured</Text>
        <Text style={{ color: DIM, fontSize: 12, lineHeight: 18 }}>Your data stays private. We only use it to generate your skin report — never sold or shared.</Text>
      </View>
    </View>
  </View>
);

// ═══════════════════════════════════════
// ANALYSIS LOADING SCREEN
// ═══════════════════════════════════════
const LOAD_MSGS = [
  'Analyzing your skin…',
  'Detecting skin concerns…',
  'Mapping your skin profile…',
  'Generating personalized routine…',
  'Finding the best DaLuxe products for you!',
];

const AnalysisScreen = ({ onDone }: { onDone: () => void }) => {
  const [msgIdx, setMsgIdx] = useState(0);
  const progress = useSharedValue(0);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 3800, easing: Easing.out(Easing.ease) });
    glow.value = withRepeat(withSequence(
      withTiming(1, { duration: 900 }),
      withTiming(0.4, { duration: 900 }),
    ), -1, true);

    const interval = setInterval(() => {
      setMsgIdx(i => {
        if (i >= LOAD_MSGS.length - 1) return i;
        return i + 1;
      });
    }, 760);

    const timer = setTimeout(onDone, 3900);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` as any }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View style={{ flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <Animated.View style={[{ marginBottom: 36 }, glowStyle]}>
        <LinearGradient colors={[GOLD_GLOW, 'rgba(212,175,55,0.05)']}
          style={{ width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: GOLD_BDR }}>
          <ScanFace color={GOLD} size={52} strokeWidth={1} />
        </LinearGradient>
      </Animated.View>

      <Text style={{ color: DARK, fontSize: isMob ? 22 : 28, fontWeight: '300', fontFamily: SERIF, textAlign: 'center', marginBottom: 8 }}>
        DaLuxe AI Analysis
      </Text>
      <GoldDivider width={60} />

      <Text key={msgIdx} style={{ color: DIM, fontSize: 14, marginTop: 8, marginBottom: 32, textAlign: 'center', letterSpacing: 0.3 }}>
        {LOAD_MSGS[msgIdx]}
      </Text>

      <View style={{ width: '100%', maxWidth: 320, height: 4, borderRadius: 4,
        backgroundColor: 'rgba(212,175,55,0.15)', overflow: 'hidden', marginBottom: 10 }}>
        <Animated.View style={[{ height: '100%', borderRadius: 4 }, barStyle]}>
          <LinearGradient colors={['#FFF1B9', GOLD, GOLD_DEEP]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
        </Animated.View>
      </View>
      <Text style={{ color: MUTED, fontSize: 11, letterSpacing: 1 }}>Processing your skin data…</Text>
    </View>
  );
};

// ═══════════════════════════════════════
// RESULTS PAGE
// ═══════════════════════════════════════
const ConcernBar = ({ label, pct, color }: any) => {
  const bar = useSharedValue(0);
  useEffect(() => { bar.value = withDelay(200, withTiming(pct / 100, { duration: 900, easing: Easing.out(Easing.ease) })); }, []);
  const barStyle = useAnimatedStyle(() => ({ width: `${bar.value * 100}%` as any }));
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: DARK, fontSize: 13, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: color, fontSize: 13, fontWeight: '700' }}>{pct}%</Text>
      </View>
      <View style={{ height: 6, backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: 6, overflow: 'hidden' }}>
        <Animated.View style={[{ height: '100%', borderRadius: 6, backgroundColor: color }, barStyle]} />
      </View>
    </View>
  );
};

const RoutineItem = ({ step, label }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: GOLD_GLOW, borderWidth: 1, borderColor: GOLD_BDR, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: GOLD, fontSize: 11, fontWeight: '700' }}>{step}</Text>
    </View>
    <Text style={{ color: DARK, fontSize: 13, flex: 1 }}>{label}</Text>
    <ChevronRight color={MUTED} size={14} />
  </View>
);

const ResultsPage = ({ name, onEmailReport }: any) => {
  const r = MOCK_RESULTS;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: BG }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#2A1F13', '#110C07']}
        style={{ paddingTop: isMob ? 56 : 72, paddingBottom: 36, paddingHorizontal: isMob ? 24 : 40, alignItems: 'center' }}>
        <Animated.View entering={FadeInDown.duration(700)} style={{ alignItems: 'center' }}>
          <Text style={{ color: GOLD_BRIGHT, fontSize: 11, fontWeight: '700', letterSpacing: 5, textTransform: 'uppercase', marginBottom: 10 }}>Your Skin Report</Text>
          <Text style={{ color: '#FFF', fontSize: isMob ? 26 : 36, fontWeight: '300', fontFamily: SERIF, textAlign: 'center' }}>
            {name ? `Hello, ${name}` : 'Your DaLuxe Report'}
          </Text>
          <GoldDivider width={80} />
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
            Powered by DaLuxe AI Skin Intelligence
          </Text>
        </Animated.View>
      </LinearGradient>

      <View style={{ padding: isMob ? 20 : 40, gap: 20 }}>
        {/* Skin Type Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={s.resultCard}>
          <Text style={s.resultCardEye}>SKIN SUMMARY</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <View>
              <Text style={{ color: MUTED, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Your Skin Type</Text>
              <Text style={{ color: DARK, fontSize: 24, fontWeight: '700', fontFamily: SERIF, marginTop: 4 }}>{r.skinType}</Text>
            </View>
            <View style={{ alignItems: 'center', padding: 16, backgroundColor: GOLD_GLOW, borderRadius: 16, borderWidth: 1, borderColor: GOLD_BDR }}>
              <Text style={{ color: GOLD, fontSize: 24, fontWeight: '700' }}>{r.confidence}%</Text>
              <Text style={{ color: MUTED, fontSize: 10, fontWeight: '600', letterSpacing: 1 }}>CONFIDENCE</Text>
            </View>
          </View>
          <View style={{ marginTop: 18, padding: 14, backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: 12, borderWidth: 1, borderColor: GOLD_BDR }}>
            <Text style={{ color: DIM, fontSize: 13, lineHeight: 20 }}>
              Your skin shows a mix of oily and dry zones — typically an oily T-zone with balanced cheeks. Requires lightweight hydration and oil-control without stripping.
            </Text>
          </View>
        </Animated.View>

        {/* Concerns */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={s.resultCard}>
          <Text style={s.resultCardEye}>DETECTED CONCERNS</Text>
          <View style={{ marginTop: 16 }}>
            {r.concerns.map(c => <ConcernBar key={c.label} {...c} />)}
          </View>
        </Animated.View>

        {/* Routine */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={s.resultCard}>
          <Text style={s.resultCardEye}>RECOMMENDED ROUTINE</Text>
          <View style={{ flexDirection: isMob ? 'column' : 'row', gap: 20, marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Sun color={GOLD} size={16} />
                <Text style={{ color: DARK, fontWeight: '700', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Morning</Text>
              </View>
              {r.morningRoutine.map((item, i) => <RoutineItem key={i} step={i + 1} label={item} />)}
            </View>
            <View style={{ width: isMob ? '100%' : 1, height: isMob ? 1 : undefined, backgroundColor: GOLD_BDR }} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Moon color={GOLD} size={16} />
                <Text style={{ color: DARK, fontWeight: '700', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Night</Text>
              </View>
              {r.nightRoutine.map((item, i) => <RoutineItem key={i} step={i + 1} label={item} />)}
            </View>
          </View>
        </Animated.View>

        {/* Recommended Products */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={s.resultCard}>
          <Text style={s.resultCardEye}>DALUXE PICKS FOR YOU</Text>
          <Text style={{ color: DIM, fontSize: 13, marginTop: 4, marginBottom: 16 }}>Products formulated for your exact skin profile</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {r.products.map(p => (
              <View key={p.id} style={{ width: 150, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: GOLD_BDR,
                backgroundColor: BG, shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 }}>
                <Image source={p.img} style={{ width: 150, height: 150 }} resizeMode="contain" />
                <View style={{ padding: 12 }}>
                  <Text style={{ color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 2 }}>DALUXE</Text>
                  <Text style={{ color: DARK, fontSize: 12, fontWeight: '700', marginTop: 2, lineHeight: 16 }}>{p.name}</Text>
                  <Text style={{ color: GOLD, fontSize: 14, fontWeight: '700', marginTop: 6 }}>{p.price}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* CTA Row */}
        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={{ flexDirection: isMob ? 'column' : 'row', gap: 12 }}>
          <GoldBtn label="Download Report" icon={Download} size="lg" onPress={() => {}} />
          <GhostBtn label="Send to Email" icon={Mail} onPress={onEmailReport} />
        </Animated.View>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// ═══════════════════════════════════════
// EMAIL MODAL
// ═══════════════════════════════════════
const EmailModal = ({ email, onClose }: any) => {
  const [val, setVal] = useState(email || '');
  const [sent, setSent] = useState(false);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: BG, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 28, paddingBottom: 40, borderTopWidth: 1, borderTopColor: GOLD_BDR }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: DARK, fontSize: 18, fontWeight: '700', fontFamily: SERIF }}>Email your Report</Text>
          <TouchableOpacity onPress={onClose}><X color={DIM} size={20} /></TouchableOpacity>
        </View>
        {sent ? (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: GOLD_GLOW, borderWidth: 1, borderColor: GOLD_BDR, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Check color={GOLD} size={28} />
            </View>
            <Text style={{ color: DARK, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Here you go!</Text>
            <Text style={{ color: DIM, fontSize: 13, marginTop: 6, textAlign: 'center' }}>Your DaLuxe skin report is on its way ✨</Text>
          </View>
        ) : (
          <>
            <Text style={s.inputLabel}>Email Address</Text>
            <TextInput value={val} onChangeText={setVal} placeholder="your@email.com"
              placeholderTextColor={MUTED} keyboardType="email-address" autoCapitalize="none" style={[s.input, { marginBottom: 18 }]} />
            <GoldBtn label="Send Report" icon={Mail} size="lg" onPress={() => setSent(true)} disabled={!val} />
          </>
        )}
      </View>
    </View>
  );
};

// ═══════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════
const HeroSection = ({ onStart }: { onStart: () => void }) => {
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(withSequence(
      withTiming(-10, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
    ), -1, true);
  }, []);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));

  return (
    <View style={{ flex: 1, minHeight: SH }}>
      <LinearGradient colors={['#FDFBF7', '#F4EFEA', '#FDFBF7']} style={StyleSheet.absoluteFillObject} />
      {/* Decorative glow circles */}
      <View style={{ position: 'absolute', top: SH * 0.15, left: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(212,175,55,0.08)' }} />
      <View style={{ position: 'absolute', bottom: SH * 0.2, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(212,175,55,0.06)' }} />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: isMob ? 28 : 60 }}>
        <Animated.View entering={FadeInDown.duration(800)} style={{ alignItems: 'center' }}>
          <Text style={{ color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 6, textTransform: 'uppercase', marginBottom: 16 }}>
            DaLuxe AI
          </Text>
        </Animated.View>

        <Animated.View style={floatStyle}>
          <LinearGradient colors={[GOLD_GLOW, 'rgba(212,175,55,0.03)']}
            style={{ width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center',
              borderWidth: 1, borderColor: GOLD_BDR, marginBottom: 28,
              ...WEB({ boxShadow: `0 0 60px rgba(212,175,55,0.2)` }) }}>
            <ScanFace color={GOLD} size={48} strokeWidth={1} />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={{ alignItems: 'center' }}>
          <Text style={{ color: DARK, fontSize: isMob ? 36 : 56, fontWeight: '300', fontFamily: SERIF,
            textAlign: 'center', lineHeight: isMob ? 44 : 68, letterSpacing: isMob ? 1 : 2, marginBottom: 20 }}>
            AI Skin{'\n'}Assessment
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={{ alignItems: 'center' }}>
          <GoldDivider width={80} />
          <Text style={{ color: DIM, fontSize: isMob ? 15 : 18, textAlign: 'center', lineHeight: isMob ? 24 : 30,
            fontWeight: '300', maxWidth: 440, marginBottom: 36, marginTop: 4 }}>
            Discover your skin type and personalized{'\n'}DaLuxe routine in seconds
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(700)} style={{ alignItems: 'center', gap: 14 }}>
          <GoldBtn label="Start Free Assessment" icon={ArrowRight} size="lg" onPress={onStart} />
          <View style={{ flexDirection: 'row', gap: 20, marginTop: 16 }}>
            {['✓ 2 min', '✓ Free', '✓ Personalized'].map(t => (
              <Text key={t} style={{ color: MUTED, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 }}>{t}</Text>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Scroll hint */}
      <View style={{ paddingBottom: 40, alignItems: 'center' }}>
        <Text style={{ color: MUTED, fontSize: 11, letterSpacing: 2 }}>SCROLL TO CONTINUE</Text>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════
type Phase = 'hero' | 'form' | 'loading' | 'results';

export default function SkinAssessmentPage() {
  const [phase, setPhase] = useState<Phase>('hero');
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const [skinType, setSkinType] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState({ sleep: '', water: '', sun: '', env: '' });
  const [info, setInfo] = useState({ name: '', email: '' });

  const TOTAL_STEPS = 5;

  const toggleConcern = (id: string) =>
    setConcerns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const canAdvance = () => {
    if (step === 1) return !!skinType;
    if (step === 2) return concerns.length > 0;
    if (step === 3) return !!(lifestyle.sleep && lifestyle.water && lifestyle.sun);
    if (step === 4) return true;
    if (step === 5) return !!(info.name && info.email);
    return false;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) { setStep(s => s + 1); }
    else { setPhase('loading'); }
  };

  if (phase === 'loading') return <AnalysisScreen onDone={() => setPhase('results')} />;
  if (phase === 'results') return (
    <View style={{ flex: 1 }}>
      <ResultsPage name={info.name} onEmailReport={() => setShowModal(true)} />
      {showModal && <EmailModal email={info.email} onClose={() => setShowModal(false)} />}
    </View>
  );

  if (phase === 'hero') return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <HeroSection onStart={() => setPhase('form')} />
    </ScrollView>
  );

  // Form phase
  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 value={skinType} onSelect={setSkinType} />;
      case 2: return <Step2 value={concerns} onToggle={toggleConcern} />;
      case 3: return <Step3 value={lifestyle} onChange={setLifestyle} />;
      case 4: return <Step4 onSkip={() => setStep(5)} />;
      case 5: return <Step5 value={info} onChange={setInfo} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ProgressBar step={step} total={TOTAL_STEPS} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: isMob ? 20 : 48, paddingBottom: 120, maxWidth: 680, alignSelf: 'center', width: '100%' }}>
        <Animated.View key={step} entering={FadeIn.duration(350)}>
          {renderStep()}
        </Animated.View>
      </ScrollView>

      {/* Sticky Bottom Nav */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: BG, paddingHorizontal: isMob ? 20 : 40, paddingVertical: 16,
        borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.15)',
        flexDirection: 'row', gap: 12, justifyContent: 'space-between' }}>
        {step > 1 ? (
          <GhostBtn label="Back" icon={ArrowLeft} onPress={() => setStep(s => s - 1)} />
        ) : (
          <View />
        )}
        <GoldBtn
          label={step === TOTAL_STEPS ? 'Analyse My Skin' : 'Next'}
          icon={step === TOTAL_STEPS ? ScanFace : ArrowRight}
          disabled={!canAdvance()}
          onPress={handleNext}
          size="lg"
        />
      </View>
    </View>
  );
}

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const s = StyleSheet.create({
  stepTitle: {
    color: DARK, fontSize: isMob ? 24 : 32, fontWeight: '300',
    fontFamily: SERIF, letterSpacing: 0.5, marginBottom: 8,
  },
  stepSub: {
    color: DIM, fontSize: 14, lineHeight: 22, marginBottom: 4,
  },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 18, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.2)',
    backgroundColor: CARD,
    ...WEB({ backdropFilter: 'blur(10px)', transition: 'all 0.2s ease', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }),
  },
  optionCardActive: {
    borderColor: GOLD, backgroundColor: GOLD_GLOW,
    ...WEB({ boxShadow: `0 4px 24px rgba(212,175,55,0.15)` }),
  },
  optionLabel: { color: DARK, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  optionDesc: { color: DIM, fontSize: 12, lineHeight: 18 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
    borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.25)',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  chipActive: {
    backgroundColor: GOLD, borderColor: GOLD,
    ...WEB({ boxShadow: `0 4px 14px rgba(212,175,55,0.3)` }),
  },
  chipLabel: { color: DIM, fontSize: 13, fontWeight: '500' },
  uploadBox: {
    borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: GOLD_BDR,
    padding: isMob ? 32 : 52, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.03)', overflow: 'hidden',
    ...WEB({ backdropFilter: 'blur(10px)' }),
  },
  inputLabel: { color: DARK, fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 },
  input: {
    borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.3)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    color: DARK, fontSize: 15, backgroundColor: CARD,
    ...WEB({ outline: 'none', fontFamily: 'inherit' }),
  },
  resultCard: {
    backgroundColor: CARD, borderRadius: 20, padding: isMob ? 20 : 28,
    borderWidth: 1, borderColor: GOLD_BDR,
    ...WEB({ backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }),
  },
  resultCardEye: {
    color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 4, textTransform: 'uppercase',
  },
});
