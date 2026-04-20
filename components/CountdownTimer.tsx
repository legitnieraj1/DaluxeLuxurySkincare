import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface CountdownTimerProps {
  endsAt: string | Date; // ISO string or Date from DB
  onExpire?: () => void;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function getTimeLeft(endsAt: string | Date): TimeLeft {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, expired: false };
}

export default function CountdownTimer({ endsAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(endsAt));

  useEffect(() => {
    if (timeLeft.expired) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => {
      const next = getTimeLeft(endsAt);
      setTimeLeft(next);
      if (next.expired) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (timeLeft.expired) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>⏰ Offer ends in</Text>
      <View style={styles.timerRow}>
        <TimerUnit value={pad(timeLeft.hours)} unit="HRS" />
        <Text style={styles.colon}>:</Text>
        <TimerUnit value={pad(timeLeft.minutes)} unit="MIN" />
        <Text style={styles.colon}>:</Text>
        <TimerUnit value={pad(timeLeft.seconds)} unit="SEC" />
      </View>
    </View>
  );
}

function TimerUnit({ value, unit }: { value: string; unit: string }) {
  return (
    <View style={styles.unit}>
      <View style={styles.digitBox}>
        <Text style={styles.digit}>{value}</Text>
      </View>
      <Text style={styles.unitLabel}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    fontSize: 11,
    color: '#D32F2F',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unit: {
    alignItems: 'center',
  },
  digitBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 36,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 2px 6px rgba(0,0,0,0.25)' } as any,
    }),
  },
  digit: {
    color: '#E9C349',
    fontWeight: '800',
    fontSize: 15,
    fontVariant: ['tabular-nums'] as any,
    ...Platform.select({
      web: { fontFamily: 'monospace' } as any,
    }),
  },
  unitLabel: {
    fontSize: 8,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  colon: {
    color: '#D32F2F',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 12,
  },
});
