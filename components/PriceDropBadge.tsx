import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PriceDropBadgeProps {
  price: number;
  originalPrice?: number | null;
  currencySymbol?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDropBadge({
  price,
  originalPrice,
  currencySymbol = '₹',
  size = 'md',
}: PriceDropBadgeProps) {
  if (!originalPrice || originalPrice <= price) {
    return (
      <Text style={[styles.currentPrice, fontSizes[size].current]}>
        {currencySymbol}{price}
      </Text>
    );
  }

  const pct = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <View style={styles.row}>
      <Text style={[styles.currentPrice, fontSizes[size].current]}>
        {currencySymbol}{price}
      </Text>
      <Text style={[styles.originalPrice, fontSizes[size].original]}>
        {currencySymbol}{originalPrice}
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{pct}% OFF</Text>
      </View>
    </View>
  );
}

const fontSizes = {
  sm: { current: { fontSize: 16 }, original: { fontSize: 12 } },
  md: { current: { fontSize: 22 }, original: { fontSize: 15 } },
  lg: { current: { fontSize: 32 }, original: { fontSize: 20 } },
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  currentPrice: {
    fontWeight: '800',
    color: '#1A1A1A',
  },
  originalPrice: {
    fontWeight: '400',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  badge: {
    backgroundColor: '#D32F2F',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
