import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';

interface UrgencyBlockProps {
  stockQuantity: number;
  lowStockThreshold?: number;
}

export default function UrgencyBlock({ stockQuantity, lowStockThreshold = 10 }: UrgencyBlockProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (stockQuantity <= lowStockThreshold && stockQuantity > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [stockQuantity]);

  if (stockQuantity <= 0) {
    return (
      <View style={[styles.badge, styles.outOfStock]}>
        <Text style={styles.dot}>●</Text>
        <Text style={styles.text}>Out of Stock</Text>
      </View>
    );
  }

  if (stockQuantity <= 5) {
    return (
      <Animated.View style={[styles.badge, styles.critical, { transform: [{ scale: pulse }] }]}>
        <Text style={styles.dot}>🔥</Text>
        <Text style={styles.text}>Only {stockQuantity} left — order now!</Text>
      </Animated.View>
    );
  }

  if (stockQuantity <= lowStockThreshold) {
    return (
      <Animated.View style={[styles.badge, styles.low, { transform: [{ scale: pulse }] }]}>
        <Text style={styles.dot}>⚡</Text>
        <Text style={styles.text}>Only {stockQuantity} left in stock</Text>
      </Animated.View>
    );
  }

  if (stockQuantity <= 25) {
    return (
      <View style={[styles.badge, styles.selling]}>
        <Text style={styles.dot}>📈</Text>
        <Text style={styles.text}>Selling fast — grab yours!</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 4,
  },
  critical: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  low: {
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  selling: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  outOfStock: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#9E9E9E',
  },
  dot: {
    fontSize: 11,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
