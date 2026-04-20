import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { supabaseClient } from '../lib/supabaseClient';

const { width: SW } = Dimensions.get('window');
const isMobile = SW < 768;

interface SocialProofBannerProps {
  /** Override the DB value with a static number */
  staticCount?: number;
}

export default function SocialProofBanner({ staticCount }: SocialProofBannerProps) {
  const [count, setCount] = useState<number>(staticCount ?? 5000);

  useEffect(() => {
    if (staticCount !== undefined) return;
    supabaseClient
      .from('site_config')
      .select('value')
      .eq('key', 'trusted_customers_count')
      .single()
      .then(({ data }) => {
        if (data?.value) setCount(Number(data.value));
      });
  }, []);

  const formatted = count >= 1000 ? `${Math.floor(count / 1000)}K+` : `${count}+`;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Stars */}
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Text key={i} style={styles.star}>★</Text>
          ))}
        </View>

        <Text style={styles.headline}>
          Trusted by <Text style={styles.accent}>{formatted} customers</Text>
        </Text>

        <Text style={styles.sub}>
          Join India's fastest-growing luxury skincare community
        </Text>

        {/* Proof pills */}
        <View style={styles.pills}>
          {PROOF_PILLS.map((p, i) => (
            <View key={i} style={styles.pill}>
              <Text style={styles.pillIcon}>{p.icon}</Text>
              <Text style={styles.pillText}>{p.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const PROOF_PILLS = [
  { icon: '🧪', text: 'Dermatologist Tested' },
  { icon: '🌿', text: 'Cruelty-Free' },
  { icon: '⭐', text: '4.8/5 avg rating' },
  { icon: '📦', text: '50,000+ orders' },
];

const styles = StyleSheet.create({
  container: {
    paddingVertical: isMobile ? 40 : 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#0B0B0B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.1)',
  },
  inner: {
    alignItems: 'center',
    maxWidth: 600,
    width: '100%',
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  star: {
    fontSize: 20,
    color: '#E9C349',
  },
  headline: {
    fontSize: isMobile ? 22 : 30,
    fontWeight: '800',
    color: '#FAFAFA',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
    ...Platform.select({
      web: { fontFamily: '"Noto Serif", Georgia, serif' } as any,
    }),
  },
  accent: {
    color: '#E9C349',
  },
  sub: {
    fontSize: isMobile ? 13 : 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(233,195,73,0.15)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});
