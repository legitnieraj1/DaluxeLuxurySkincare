import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Dimensions,
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
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Award, Shield, Leaf, Heart, Gem, Droplets } from 'lucide-react-native';

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
// ANIMATED GOLD DIVIDER
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
// VALUE PILLAR COMPONENT
// ════════════════════════════════════════════════
const ValuePillar = ({ icon: Icon, title, description, index }: {
  icon: any;
  title: string;
  description: string;
  index: number;
}) => (
  <Animated.View
    entering={FadeInUp.delay(200 + index * 150).duration(700)}
    style={s.valuePillar}
  >
    <View style={s.valuePillarIconWrap}>
      <Icon color={GOLD} size={26} />
    </View>
    <Text style={s.valuePillarTitle}>{title}</Text>
    <View style={{ width: 24, height: 1, backgroundColor: GOLD_BORDER, marginVertical: 10 }} />
    <Text style={s.valuePillarDesc}>{description}</Text>
  </Animated.View>
);

// ════════════════════════════════════════════════
// TIMELINE MILESTONE COMPONENT
// ════════════════════════════════════════════════
const TimelineMilestone = ({ year, title, description, index }: {
  year: string;
  title: string;
  description: string;
  index: number;
}) => (
  <Animated.View
    entering={FadeInLeft.delay(300 + index * 200).duration(600)}
    style={s.timelineItem}
  >
    <View style={s.timelineDot}>
      <View style={s.timelineDotInner} />
    </View>
    <View style={s.timelineContent}>
      <Text style={s.timelineYear}>{year}</Text>
      <Text style={s.timelineTitle}>{title}</Text>
      <Text style={s.timelineDesc}>{description}</Text>
    </View>
  </Animated.View>
);

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════
export default function OurStoryPage() {
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  // Parallax hero
  const heroParallax = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, 400], [0, -80], Extrapolation.CLAMP) }],
    opacity: interpolate(scrollY.value, [0, 350], [1, 0.2], Extrapolation.CLAMP),
  }));

  return (
    <Animated.ScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      style={{ flex: 1, backgroundColor: CREAM }}
      showsVerticalScrollIndicator={false}
    >

      {/* ═══════════ HERO SECTION ═══════════ */}
      <View style={s.heroSection}>
        <LinearGradient
          colors={['#1a1a1a', '#2c2420', '#3d2e24']}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Subtle gold grain overlay */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(201,168,76,0.03)' }]} />

        <Animated.View style={[s.heroContent, heroParallax]}>
          <Animated.View entering={FadeInDown.duration(900)}>
            <Text style={s.heroEyebrow}>EST. 2024</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(900)}>
            <Text style={s.heroTitle}>Our Story</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(900)}>
            <View style={s.heroGoldLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(900)}>
            <Text style={s.heroTagline}>
              Where science meets botanical artistry{'\n'}to redefine luxury skincare
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Bottom fade gradient */}
        <LinearGradient
          colors={['transparent', CREAM]}
          style={s.heroFade}
        />
      </View>

      {/* ═══════════ PHILOSOPHY INTRO ═══════════ */}
      <View style={s.section}>
        <Animated.View entering={FadeInUp.delay(100).duration(700)} style={s.philosophyBlock}>
          <Text style={s.sectionEyebrow}>THE PHILOSOPHY</Text>
          <GoldDivider width={40} />
          <Text style={s.philosophyQuote}>
            "True luxury is not merely what you see{'\n'}— it is what your skin feels."
          </Text>
          <Text style={s.philosophyAttribution}>— The Founders, DaLuxe</Text>
        </Animated.View>
      </View>

      {/* ═══════════ ORIGIN STORY ═══════════ */}
      <View style={s.section}>
        <View style={isMobile ? s.originBlockMobile : s.originBlock}>
          <Animated.View
            entering={FadeInLeft.delay(100).duration(700)}
            style={isMobile ? s.originImageWrapMobile : s.originImageWrap}
          >
            <Image
              source={require('./assets/facewash_story.jpg')}
              style={s.originImage}
              resizeMode="cover"
            />
            <View style={s.originImageOverlay}>
              <LinearGradient
                colors={['transparent', 'rgba(26,26,26,0.4)']}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInRight.delay(300).duration(700)}
            style={isMobile ? s.originTextMobile : s.originText}
          >
            <Text style={s.sectionEyebrow}>THE BEGINNING</Text>
            <GoldDivider width={30} style={{ alignItems: 'flex-start' }} />
            <Text style={s.originTitle}>Born from a{'\n'}Simple Truth</Text>
            <Text style={s.originBody}>
              DaLuxe was born from a conviction that luxury skincare should never compromise on purity. Our founders, driven by a passion for dermal science and botanical heritage, set out to create formulations that honor both.
            </Text>
            <Text style={s.originBody}>
              Every product begins its journey in our research labs — where cutting-edge dermal science meets time-honored botanical wisdom. We source the finest ingredients from across the globe, each selected for its proven efficacy and purity.
            </Text>
            <View style={s.originAccent}>
              <Sparkles color={GOLD} size={16} />
              <Text style={s.originAccentText}>ISO & GMP Certified Excellence</Text>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* ═══════════ VALUES PILLARS ═══════════ */}
      <View style={[s.section, { backgroundColor: CREAM_WARM }]}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={s.sectionEyebrow}>OUR VALUES</Text>
          <GoldDivider width={40} />
          <Text style={s.sectionTitle}>The Pillars of DaLuxe</Text>
        </Animated.View>

        <View style={s.valuePillarsRow}>
          <ValuePillar
            icon={Gem}
            title="Dermal-Grade Purity"
            description="Every ingredient meets pharmaceutical-grade standards. No fillers, no compromises — only what your skin truly deserves."
            index={0}
          />
          <ValuePillar
            icon={Leaf}
            title="Botanical Heritage"
            description="We harness centuries of herbal wisdom, selecting each extract for its proven ability to nourish, restore, and protect."
            index={1}
          />
          <ValuePillar
            icon={Shield}
            title="Sensitive-First Design"
            description="Formulated from the ground up for sensitive skin. Gentle enough for the most delicate complexions, powerful enough for visible results."
            index={2}
          />
          <ValuePillar
            icon={Heart}
            title="Conscious Luxury"
            description="Sustainable sourcing, ethical practices, and eco-conscious packaging. Luxury that cares for both you and the world."
            index={3}
          />
        </View>
      </View>

      {/* ═══════════ BY THE NUMBERS ═══════════ */}
      <View style={s.section}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={s.sectionEyebrow}>BY THE NUMBERS</Text>
          <GoldDivider width={40} />
        </Animated.View>

        <View style={s.statsRow}>
          {[
            { value: '100%', label: 'Botanical\nIngredients' },
            { value: '0', label: 'Harmful\nChemicals' },
            { value: '3+', label: 'Years of\nResearch' },
            { value: '50K+', label: 'Happy\nCustomers' },
          ].map((stat, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(200 + i * 100).duration(600)}
              style={s.statItem}
            >
              <Text style={s.statValue}>{stat.value}</Text>
              <View style={{ width: 20, height: 1, backgroundColor: GOLD_BORDER, marginVertical: 8 }} />
              <Text style={s.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ═══════════ JOURNEY TIMELINE ═══════════ */}
      <View style={[s.section, { backgroundColor: CREAM_WARM }]}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={s.sectionEyebrow}>THE JOURNEY</Text>
          <GoldDivider width={40} />
          <Text style={s.sectionTitle}>Milestones of Excellence</Text>
        </Animated.View>

        <View style={s.timeline}>
          <View style={s.timelineLine} />
          <TimelineMilestone
            year="2022"
            title="The Vision"
            description="Our founders unite a shared passion for dermal science and botanical luxury."
            index={0}
          />
          <TimelineMilestone
            year="2023"
            title="Research & Development"
            description="Over 200 formulation trials to perfect our dermal-grade botanical approach."
            index={1}
          />
          <TimelineMilestone
            year="2024"
            title="DaLuxe Launches"
            description="The debut collection — Gold Glow Facewash, Hair Serum, and Night Cream — enters the world."
            index={2}
          />
          <TimelineMilestone
            year="2025"
            title="ISO & GMP Certified"
            description="Full certification achieved, affirming our commitment to pharmaceutical-grade quality."
            index={3}
          />
        </View>
      </View>

      {/* ═══════════ CRAFTSMANSHIP SECTION ═══════════ */}
      <View style={s.section}>
        <View style={isMobile ? s.craftBlockMobile : s.craftBlock}>
          <Animated.View
            entering={FadeInLeft.delay(100).duration(700)}
            style={isMobile ? s.craftTextMobile : s.craftText}
          >
            <Text style={s.sectionEyebrow}>THE CRAFT</Text>
            <GoldDivider width={30} style={{ alignItems: 'flex-start' }} />
            <Text style={s.originTitle}>Precision in{'\n'}Every Drop</Text>
            <Text style={s.originBody}>
              Our formulations are not mass-produced. Each batch is carefully crafted in small quantities to maintain the highest standards of purity and potency.
            </Text>
            <Text style={s.originBody}>
              From sourcing to bottling, every step is overseen by our team of dermal scientists — ensuring that what reaches your skin is nothing less than extraordinary.
            </Text>

            <View style={s.craftBadges}>
              {[
                { icon: Award, label: 'ISO Certified' },
                { icon: Shield, label: 'GMP Certified' },
                { icon: Droplets, label: 'Dermal-Grade' },
              ].map((badge, i) => (
                <View key={i} style={s.craftBadge}>
                  <badge.icon color={GOLD} size={18} />
                  <Text style={s.craftBadgeText}>{badge.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInRight.delay(300).duration(700)}
            style={isMobile ? s.craftImageWrapMobile : s.craftImageWrap}
          >
            <Image
              source={require('./assets/hero_background_new.jpg')}
              style={s.originImage}
              resizeMode="cover"
            />
          </Animated.View>
        </View>
      </View>

      {/* ═══════════ CLOSING PROMISE ═══════════ */}
      <View style={s.closingSection}>
        <LinearGradient
          colors={['#1a1a1a', '#2c2420', '#1a1a1a']}
          style={StyleSheet.absoluteFillObject}
        />
        <Animated.View entering={FadeInDown.duration(800)} style={s.closingContent}>
          <Sparkles color={GOLD} size={24} style={{ opacity: 0.7, marginBottom: 20 }} />
          <Text style={s.closingTitle}>Our Promise</Text>
          <View style={{ width: 50, height: 1, backgroundColor: GOLD_BORDER, marginVertical: 20 }} />
          <Text style={s.closingText}>
            Every DaLuxe product is a testament to our unwavering pursuit of excellence — formulated with the finest botanicals, backed by science, and crafted with love.
          </Text>
          <Text style={s.closingSignature}>DaLuxe — Luxury, Redefined.</Text>
        </Animated.View>
      </View>

      {/* ═══════════ FOOTER ═══════════ */}
      <View style={s.footer}>
        <View style={s.footerLine} />
        <Image source={require('./assets/logo.png')} style={s.footerLogo} resizeMode="contain" />
        <Text style={s.footerText}>Dermal-Grade Botanical Formula</Text>
        <Text style={s.footerText}>ISO & GMP Certified {'\u00B7'} Made in India</Text>
        <View style={s.footerLine} />
      </View>
      <View style={{ height: 60 }} />

    </Animated.ScrollView>
  );
}

// ════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════
const s = StyleSheet.create({
  // HERO
  heroSection: {
    height: isMobile ? 500 : 620,
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
    paddingVertical: isMobile ? 50 : 80,
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
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontSize: isMobile ? 28 : 38,
    fontWeight: '300',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: SERIF,
    marginBottom: 40,
  },

  // PHILOSOPHY
  philosophyBlock: {
    alignItems: 'center',
    maxWidth: 700,
  },
  philosophyQuote: {
    color: TEXT_PRIMARY,
    fontSize: isMobile ? 22 : 30,
    fontWeight: '300',
    lineHeight: isMobile ? 34 : 46,
    textAlign: 'center',
    fontFamily: SERIF,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  philosophyAttribution: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // ORIGIN STORY
  originBlock: {
    flexDirection: 'row',
    maxWidth: 1100,
    width: '100%',
    gap: 60,
    alignItems: 'center',
  },
  originBlockMobile: {
    flexDirection: 'column',
    width: '100%',
    gap: 30,
  },
  originImageWrap: {
    flex: 1,
    height: 520,
    borderRadius: 4,
    overflow: 'hidden',
  },
  originImageWrapMobile: {
    width: '100%',
    height: 280,
    borderRadius: 4,
    overflow: 'hidden',
  },
  originImage: {
    width: '100%',
    height: '100%',
  },
  originImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  originText: {
    flex: 1,
    paddingVertical: 20,
  },
  originTextMobile: {
    width: '100%',
  },
  originTitle: {
    color: TEXT_PRIMARY,
    fontSize: isMobile ? 28 : 36,
    fontWeight: '300',
    lineHeight: isMobile ? 36 : 46,
    fontFamily: SERIF,
    letterSpacing: 1,
    marginBottom: 24,
  },
  originBody: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '400',
    marginBottom: 16,
    maxWidth: 460,
  },
  originAccent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: GOLD_BORDER,
  },
  originAccentText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // VALUE PILLARS
  valuePillarsRow: {
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isMobile ? 30 : 24,
    maxWidth: 1100,
    width: '100%',
  },
  valuePillar: {
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
  valuePillarIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GOLD_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  valuePillarTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  valuePillarDesc: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '400',
  },

  // STATS
  statsRow: {
    flexDirection: isMobile ? 'row' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isMobile ? 20 : 60,
    maxWidth: 900,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: isMobile ? 130 : 140,
  },
  statValue: {
    color: TEXT_PRIMARY,
    fontSize: isMobile ? 36 : 48,
    fontWeight: '200',
    fontFamily: SERIF,
    letterSpacing: 2,
  },
  statLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 18,
  },

  // TIMELINE
  timeline: {
    maxWidth: 600,
    width: '100%',
    marginTop: 10,
    paddingLeft: 30,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 10,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: GOLD_BORDER,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 36,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    marginLeft: -21,
    marginTop: 2,
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
  },
  timelineContent: {
    flex: 1,
  },
  timelineYear: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 4,
  },
  timelineTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: SERIF,
    marginBottom: 6,
  },
  timelineDesc: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },

  // CRAFTSMANSHIP
  craftBlock: {
    flexDirection: 'row',
    maxWidth: 1100,
    width: '100%',
    gap: 60,
    alignItems: 'center',
  },
  craftBlockMobile: {
    flexDirection: 'column',
    width: '100%',
    gap: 30,
  },
  craftText: {
    flex: 1,
    paddingVertical: 20,
  },
  craftTextMobile: {
    width: '100%',
  },
  craftImageWrap: {
    flex: 1,
    height: 480,
    borderRadius: 4,
    overflow: 'hidden',
  },
  craftImageWrapMobile: {
    width: '100%',
    height: 260,
    borderRadius: 4,
    overflow: 'hidden',
  },
  craftBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 24,
  },
  craftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GOLD_LIGHT,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
  },
  craftBadgeText: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // CLOSING
  closingSection: {
    paddingVertical: isMobile ? 60 : 100,
    paddingHorizontal: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  closingContent: {
    alignItems: 'center',
    maxWidth: 560,
    zIndex: 2,
  },
  closingTitle: {
    color: WHITE,
    fontSize: isMobile ? 32 : 42,
    fontWeight: '300',
    letterSpacing: 4,
    fontFamily: SERIF,
    textAlign: 'center',
  },
  closingText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 28,
  },
  closingSignature: {
    color: GOLD,
    fontSize: 14,
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
