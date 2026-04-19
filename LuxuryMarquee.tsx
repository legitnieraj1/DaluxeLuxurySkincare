import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabaseClient } from './lib/supabaseClient';

const { width: SW } = Dimensions.get('window');
const isMobile = SW < 768;

const DEFAULT_ITEMS = [
  'Paraben-Free',
  'Rose Hydrosol Infusion',
  'Ayurvedic Wisdom × Modern Science',
  'Sulfate-Free',
  'Saffron Glow Extract',
  'Luxury Botanical Skincare',
  'Alcohol-Free',
  'Licorice Brightening Complex',
  'Sensitive Skin First Formulation',
  'pH Balanced',
  'Aloe Vera Hydration Boost',
  'Clean & Conscious Beauty',
  'Dermatologically Inspired',
  'Kumkumadi Taila Blend',
  'Cruelty-Free',
  'Gold Infusion Skincare',
  'No Irritation Formula',
  'ISO & GMP Certified',
  'Suitable for Sensitive Skin',
  'Botanical Active Technology',
];

const ITEM_WIDTH = isMobile ? 220 : 320;

export default function LuxuryMarquee() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [enabled, setEnabled] = useState(true);
  const translateX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<any>(null);

  // Fetch announcements and marquee_enabled from DB
  const fetchAnnouncements = async () => {
    const { data, error } = await supabaseClient
      .from('announcements')
      .select('text, active, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error) {
      console.warn('[LuxuryMarquee] fetchAnnouncements error:', error.message);
    }
    if (data && data.length > 0) {
      setItems(data.map((d) => d.text));
    } else {
      setItems(DEFAULT_ITEMS);
    }
  };

  const fetchMarqueeEnabled = async () => {
    const { data, error } = await supabaseClient
      .from('site_config')
      .select('value')
      .eq('key', 'marquee_enabled')
      .single();
    if (error) {
      console.warn('[LuxuryMarquee] fetchMarqueeEnabled error:', error.message);
      return; // keep default enabled=true
    }
    if (data) {
      // value is stored as JSONB — could be boolean true/false or string "true"/"false"
      const val = data.value;
      setEnabled(val !== false && val !== 'false' && val !== null);
    }
  };

  // Initial load + real-time subscriptions
  useEffect(() => {
    fetchAnnouncements();
    fetchMarqueeEnabled();

    // Subscribe to announcement changes (add/edit/delete/toggle)
    const channel = supabaseClient
      .channel('marquee-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          fetchAnnouncements();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_config' },
        (payload: any) => {
          if (payload.new?.key === 'marquee_enabled') {
            const val = payload.new?.value;
            setEnabled(val !== false && val !== 'false');
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const ALL = [...items, ...items, ...items];
  const TOTAL_SCROLL = items.length * ITEM_WIDTH;

  const startAnimation = () => {
    translateX.setValue(0);
    animRef.current = Animated.loop(
      Animated.timing(translateX, {
        toValue: -TOTAL_SCROLL,
        duration: 55000,
        useNativeDriver: true,
        isInteraction: false,
      } as any)
    );
    animRef.current.start();
  };

  useEffect(() => {
    if (!enabled) {
      animRef.current?.stop();
      return;
    }
    startAnimation();
    return () => animRef.current?.stop();
  }, [enabled, items]);

  const handleMouseEnter = () => {
    if (Platform.OS === 'web') animRef.current?.stop();
  };
  const handleMouseLeave = () => {
    if (Platform.OS === 'web') startAnimation();
  };

  if (!enabled) return null;

  return (
    <View
      style={s.container}
      {...(Platform.OS === 'web'
        ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }
        : {})}
    >
      {/* Glassmorphic backdrop */}
      <View style={s.glassBg} />

      {/* Edge fades */}
      <LinearGradient
        colors={['rgba(11,11,11,0.95)', 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={s.fadeLeft}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(11,11,11,0.95)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={s.fadeRight}
        pointerEvents="none"
      />

      <View style={s.overflow}>
        <Animated.View style={[s.track, { transform: [{ translateX }] }]}>
          {ALL.map((item, i) => (
            <View key={i} style={s.item}>
              <Text style={s.text}>{item}</Text>
              <Text style={s.dot}>✦</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const SERIF = Platform.select({
  web: '"Noto Serif", Georgia, "Playfair Display", serif',
  default: undefined,
});

const s = StyleSheet.create({
  container: {
    paddingVertical: isMobile ? 18 : 22,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    ...Platform.select({ web: { overflow: 'hidden' } as any }),
  },
  glassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,11,11,0.55)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        background: 'rgba(11,11,11,0.55)',
      } as any,
    }),
  },
  overflow: {
    overflow: 'hidden',
    flexDirection: 'row',
    width: '100%',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    width: ITEM_WIDTH,
  },
  text: {
    fontFamily: SERIF,
    fontSize: isMobile ? 12 : 15,
    fontWeight: '400',
    letterSpacing: isMobile ? 1.5 : 2,
    textTransform: 'uppercase',
    color: '#D4AF37',
    flexShrink: 1,
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(90deg, #D4AF37, #F5D06F, #D4AF37)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      } as any,
    }),
  },
  dot: {
    color: '#D4AF37',
    fontSize: 9,
    opacity: 0.4,
    marginHorizontal: isMobile ? 12 : 20,
  },
  fadeLeft: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: isMobile ? 50 : 140,
    zIndex: 10,
  },
  fadeRight: {
    position: 'absolute',
    right: 0, top: 0, bottom: 0,
    width: isMobile ? 50 : 140,
    zIndex: 10,
  },
});
