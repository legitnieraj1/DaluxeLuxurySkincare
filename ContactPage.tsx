import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Instagram,
  MessageCircle,
} from 'lucide-react-native';

const { width: SW } = Dimensions.get('window');

// ════════════════════════════════════════════════
// LUXURY LIGHT THEME (matching CollectionPage)
// ════════════════════════════════════════════════
const CREAM = '#FAF7F2';
const CREAM_WARM = '#F5F0E8';
const CREAM_SOFT = '#FFF9F0';
const GOLD = '#C9A84C';
const GOLD_LIGHT = 'rgba(201,168,76,0.12)';
const GOLD_BORDER = 'rgba(201,168,76,0.25)';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#555555';
const TEXT_MUTED = '#999999';
const BORDER = 'rgba(0,0,0,0.08)';
const WHITE = '#ffffff';
const SERIF = Platform.select({
  web: 'Georgia, "Playfair Display", "Times New Roman", serif',
  default: undefined,
});

const isMobile = SW < 768;

// ════════════════════════════════════════════════
// GOLD DIVIDER
// ════════════════════════════════════════════════
const GoldDivider = ({ width: w = 60, style }: { width?: number; style?: any }) => (
  <View style={[{ alignItems: 'center', marginVertical: 24 }, style]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: w, height: 1, backgroundColor: GOLD_BORDER }} />
      <Sparkles color={GOLD} size={14} style={{ opacity: 0.6 }} />
      <View style={{ width: w, height: 1, backgroundColor: GOLD_BORDER }} />
    </View>
  </View>
);

// ════════════════════════════════════════════════
// CONTACT INFO CARD
// ════════════════════════════════════════════════
const ContactInfoCard = ({ icon: Icon, title, lines, index }: {
  icon: any;
  title: string;
  lines: string[];
  index: number;
}) => (
  <Animated.View
    entering={FadeInUp.delay(200 + index * 150).duration(700)}
    style={c.infoCard}
  >
    <View style={c.infoCardIconWrap}>
      <Icon color={GOLD} size={22} />
    </View>
    <Text style={c.infoCardTitle}>{title}</Text>
    <View style={{ width: 20, height: 1, backgroundColor: GOLD_BORDER, marginVertical: 8 }} />
    {lines.map((line, i) => (
      <Text key={i} style={c.infoCardLine}>{line}</Text>
    ))}
  </Animated.View>
);

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════
export default function ContactPage() {
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // Parallax hero
  const heroParallax = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, 400], [0, -80], Extrapolation.CLAMP) }],
    opacity: interpolate(scrollY.value, [0, 350], [1, 0.2], Extrapolation.CLAMP),
  }));

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <Animated.ScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      style={{ flex: 1, backgroundColor: CREAM }}
      showsVerticalScrollIndicator={false}
    >

      {/* ═══════════ HERO SECTION ═══════════ */}
      <View style={c.heroSection}>
        <LinearGradient
          colors={['#1a1a1a', '#2c2420', '#3d2e24']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(201,168,76,0.03)' }]} />

        <Animated.View style={[c.heroContent, heroParallax]}>
          <Animated.View entering={FadeInDown.duration(900)}>
            <Text style={c.heroEyebrow}>GET IN TOUCH</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(900)}>
            <Text style={c.heroTitle}>Contact</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(900)}>
            <View style={c.heroGoldLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(900)}>
            <Text style={c.heroTagline}>
              We would love to hear from you.{'\n'}Every inquiry receives our full attention.
            </Text>
          </Animated.View>
        </Animated.View>

        <LinearGradient
          colors={['transparent', CREAM]}
          style={c.heroFade}
        />
      </View>

      {/* ═══════════ CONTACT INFO CARDS ═══════════ */}
      <View style={c.section}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={c.sectionEyebrow}>REACH US</Text>
          <GoldDivider width={40} />
        </Animated.View>

        <View style={c.infoCardsRow}>
          <ContactInfoCard
            icon={Mail}
            title="Email"
            lines={['care@daluxe.in', 'business@daluxe.in']}
            index={0}
          />
          <ContactInfoCard
            icon={Phone}
            title="Phone"
            lines={['+91 98765 43210', 'Mon–Sat, 10am–7pm IST']}
            index={1}
          />
          <ContactInfoCard
            icon={MapPin}
            title="Address"
            lines={['DaLuxe Skincare Pvt. Ltd.', 'Chennai, Tamil Nadu', 'India']}
            index={2}
          />
          <ContactInfoCard
            icon={Clock}
            title="Hours"
            lines={['Monday – Saturday', '10:00 AM – 7:00 PM IST', 'Sunday — Closed']}
            index={3}
          />
        </View>
      </View>

      {/* ═══════════ FORM + SIDE CONTENT ═══════════ */}
      <View style={[c.section, { backgroundColor: CREAM_WARM }]}>
        <View style={isMobile ? c.formBlockMobile : c.formBlock}>

          {/* LEFT: Contact Form */}
          <Animated.View
            entering={FadeInLeft.delay(100).duration(700)}
            style={isMobile ? c.formWrapMobile : c.formWrap}
          >
            <Text style={c.sectionEyebrow}>SEND A MESSAGE</Text>
            <GoldDivider width={30} style={{ alignItems: 'flex-start' }} />
            <Text style={c.formTitle}>We're Here to Help</Text>

            {submitted ? (
              <Animated.View entering={FadeInUp.duration(500)} style={c.successBlock}>
                <Sparkles color={GOLD} size={32} style={{ marginBottom: 16 }} />
                <Text style={c.successTitle}>Message Received</Text>
                <Text style={c.successText}>
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </Text>
                <TouchableOpacity
                  style={c.resetBtn}
                  onPress={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                >
                  <Text style={c.resetBtnText}>Send Another Message</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={c.form}>
                <View style={c.formRow}>
                  <View style={[c.inputGroup, { flex: 1 }]}>
                    <Text style={c.inputLabel}>Full Name</Text>
                    <TextInput
                      style={c.input}
                      value={formData.name}
                      onChangeText={(t) => setFormData((p) => ({ ...p, name: t }))}
                      placeholder="Your name"
                      placeholderTextColor={TEXT_MUTED}
                    />
                  </View>
                  <View style={[c.inputGroup, { flex: 1 }]}>
                    <Text style={c.inputLabel}>Email Address</Text>
                    <TextInput
                      style={c.input}
                      value={formData.email}
                      onChangeText={(t) => setFormData((p) => ({ ...p, email: t }))}
                      placeholder="your@email.com"
                      placeholderTextColor={TEXT_MUTED}
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={c.inputGroup}>
                  <Text style={c.inputLabel}>Subject</Text>
                  <TextInput
                    style={c.input}
                    value={formData.subject}
                    onChangeText={(t) => setFormData((p) => ({ ...p, subject: t }))}
                    placeholder="How can we help?"
                    placeholderTextColor={TEXT_MUTED}
                  />
                </View>

                <View style={c.inputGroup}>
                  <Text style={c.inputLabel}>Message</Text>
                  <TextInput
                    style={[c.input, c.textarea]}
                    value={formData.message}
                    onChangeText={(t) => setFormData((p) => ({ ...p, message: t }))}
                    placeholder="Tell us more..."
                    placeholderTextColor={TEXT_MUTED}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={c.submitBtn}
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={c.submitBtnText}>Send Message</Text>
                  <Send color={WHITE} size={16} style={{ marginLeft: 10 }} />
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* RIGHT: Assurance Panel */}
          <Animated.View
            entering={FadeInRight.delay(300).duration(700)}
            style={isMobile ? c.assurancePanelMobile : c.assurancePanel}
          >
            <View style={c.assuranceCard}>
              <LinearGradient
                colors={['#1a1a1a', '#2c2420']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={c.assuranceCardInner}>
                <Sparkles color={GOLD} size={20} style={{ marginBottom: 20, opacity: 0.7 }} />
                <Text style={c.assuranceTitle}>The DaLuxe{'\n'}Experience</Text>
                <View style={{ width: 30, height: 1, backgroundColor: GOLD_BORDER, marginVertical: 20 }} />

                {[
                  { icon: '01', text: 'Personalized skincare consultations' },
                  { icon: '02', text: 'Expert guidance on your routine' },
                  { icon: '03', text: 'Priority access to new launches' },
                  { icon: '04', text: 'Complimentary samples with orders' },
                ].map((item, i) => (
                  <View key={i} style={c.assuranceItem}>
                    <Text style={c.assuranceNumber}>{item.icon}</Text>
                    <Text style={c.assuranceText}>{item.text}</Text>
                  </View>
                ))}

                <View style={{ width: 30, height: 1, backgroundColor: GOLD_BORDER, marginTop: 24, marginBottom: 20 }} />
                <Text style={c.assuranceFooter}>
                  Every message is answered{'\n'}within 24 hours
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* ═══════════ SOCIAL / CONNECT SECTION ═══════════ */}
      <View style={c.section}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={c.sectionEyebrow}>FOLLOW US</Text>
          <GoldDivider width={40} />
          <Text style={c.socialTitle}>Stay Connected</Text>
          <Text style={c.socialSubtitle}>
            Follow our journey and be the first to know{'\n'}about new launches and exclusive offers.
          </Text>
        </Animated.View>

        <View style={c.socialRow}>
          {[
            { icon: Instagram, label: 'Instagram', handle: '@daluxe.in' },
            { icon: MessageCircle, label: 'WhatsApp', handle: '+91 98765 43210' },
            { icon: Mail, label: 'Email', handle: 'care@daluxe.in' },
          ].map((social, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(200 + i * 150).duration(600)}
              style={c.socialCard}
            >
              <View style={c.socialIconWrap}>
                <social.icon color={GOLD} size={24} />
              </View>
              <Text style={c.socialLabel}>{social.label}</Text>
              <Text style={c.socialHandle}>{social.handle}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ═══════════ CLOSING BAND ═══════════ */}
      <View style={c.closingBand}>
        <LinearGradient
          colors={['#1a1a1a', '#2c2420', '#1a1a1a']}
          style={StyleSheet.absoluteFillObject}
        />
        <Animated.View entering={FadeInDown.duration(700)} style={c.closingContent}>
          <Text style={c.closingText}>
            Your skin deserves the finest care — and so do you.
          </Text>
          <Text style={c.closingSignature}>DaLuxe — Luxury, Redefined.</Text>
        </Animated.View>
      </View>

      {/* ═══════════ FOOTER ═══════════ */}
      <View style={c.footer}>
        <View style={c.footerLine} />
        <Image source={require('./assets/logo.png')} style={c.footerLogo} resizeMode="contain" />
        <Text style={c.footerText}>Dermal-Grade Botanical Formula</Text>
        <Text style={c.footerText}>ISO & GMP Certified {'\u00B7'} Made in India</Text>
        <View style={c.footerLine} />
      </View>
      <View style={{ height: 60 }} />

    </Animated.ScrollView>
  );
}

// ════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════
const c = StyleSheet.create({
  // HERO
  heroSection: {
    height: isMobile ? 450 : 560,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 2,
  },
  heroEyebrow: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroTitle: {
    color: WHITE,
    fontSize: isMobile ? 48 : 72,
    fontWeight: '300',
    letterSpacing: isMobile ? 4 : 8,
    textAlign: 'center',
    fontFamily: SERIF,
    marginBottom: 24,
  },
  heroGoldLine: {
    width: 80,
    height: 1,
    backgroundColor: GOLD,
    marginBottom: 28,
    alignSelf: 'center',
  },
  heroTagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isMobile ? 15 : 18,
    lineHeight: isMobile ? 24 : 30,
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 1,
    maxWidth: 480,
  },
  heroFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },

  // SECTIONS
  section: {
    paddingVertical: isMobile ? 50 : 70,
    paddingHorizontal: isMobile ? 24 : 60,
    alignItems: 'center',
  },
  sectionEyebrow: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },

  // CONTACT INFO CARDS
  infoCardsRow: {
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isMobile ? 16 : 20,
    maxWidth: 1100,
    width: '100%',
    marginTop: 8,
  },
  infoCard: {
    flex: isMobile ? undefined : 1,
    minWidth: isMobile ? '100%' : 220,
    maxWidth: isMobile ? '100%' : 260,
    alignItems: 'center',
    padding: 28,
    backgroundColor: WHITE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 20px rgba(0,0,0,0.04)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      },
    }),
  },
  infoCardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GOLD_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoCardTitle: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoCardLine: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
  },

  // FORM BLOCK
  formBlock: {
    flexDirection: 'row',
    maxWidth: 1100,
    width: '100%',
    gap: 48,
    alignItems: 'flex-start',
  },
  formBlockMobile: {
    flexDirection: 'column',
    width: '100%',
    gap: 30,
  },
  formWrap: {
    flex: 1.4,
  },
  formWrapMobile: {
    width: '100%',
  },
  formTitle: {
    color: TEXT_PRIMARY,
    fontSize: isMobile ? 26 : 32,
    fontWeight: '300',
    fontFamily: SERIF,
    letterSpacing: 1,
    marginBottom: 28,
  },
  form: {
    gap: 20,
  },
  formRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 16,
  },
  inputGroup: {
    marginBottom: 0,
  },
  inputLabel: {
    color: TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: '400',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        transition: 'border-color 0.2s ease',
      },
    }),
  },
  textarea: {
    minHeight: 130,
    paddingTop: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TEXT_PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, transform 0.2s ease',
      },
    }),
  },
  submitBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // SUCCESS STATE
  successBlock: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: WHITE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  successTitle: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '300',
    fontFamily: SERIF,
    letterSpacing: 2,
    marginBottom: 12,
  },
  successText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 24,
    maxWidth: 340,
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  resetBtnText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ASSURANCE PANEL
  assurancePanel: {
    flex: 1,
  },
  assurancePanelMobile: {
    width: '100%',
  },
  assuranceCard: {
    borderRadius: 4,
    overflow: 'hidden',
    minHeight: 420,
  },
  assuranceCardInner: {
    padding: isMobile ? 28 : 36,
    zIndex: 2,
  },
  assuranceTitle: {
    color: WHITE,
    fontSize: isMobile ? 26 : 30,
    fontWeight: '300',
    fontFamily: SERIF,
    letterSpacing: 2,
    lineHeight: isMobile ? 34 : 40,
  },
  assuranceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
  },
  assuranceNumber: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
    width: 20,
  },
  assuranceText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
    flex: 1,
  },
  assuranceFooter: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
  },

  // SOCIAL
  socialTitle: {
    color: TEXT_PRIMARY,
    fontSize: isMobile ? 26 : 34,
    fontWeight: '300',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: SERIF,
    marginBottom: 12,
  },
  socialSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 32,
  },
  socialRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 16 : 24,
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  socialCard: {
    flex: isMobile ? undefined : 1,
    alignItems: 'center',
    padding: 28,
    backgroundColor: WHITE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 20px rgba(0,0,0,0.04)',
      },
    }),
  },
  socialIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GOLD_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  socialLabel: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  socialHandle: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '400',
  },

  // CLOSING
  closingBand: {
    paddingVertical: isMobile ? 50 : 70,
    paddingHorizontal: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  closingContent: {
    alignItems: 'center',
    maxWidth: 500,
    zIndex: 2,
  },
  closingText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: isMobile ? 17 : 20,
    lineHeight: isMobile ? 28 : 32,
    textAlign: 'center',
    fontWeight: '300',
    fontFamily: SERIF,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  closingSignature: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },

  // FOOTER
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: CREAM,
  },
  footerLine: { width: 40, height: 1, backgroundColor: GOLD_BORDER, marginVertical: 14 },
  footerLogo: { height: 40, width: 100, marginBottom: 12, opacity: 0.8 },
  footerText: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 18,
    textTransform: 'uppercase',
  },
});
