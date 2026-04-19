import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  Animated, Pressable, Dimensions, Image,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

const WA_NUMBER = '916201503466';

const TEMPLATES = [
  { label: 'Order Enquiry', message: 'Hi! I have an order enquiry regarding a Daluxe product.' },
  { label: 'I want to invest', message: 'Hi! I am interested in investing with Daluxe. Could you share more details?' },
  { label: 'Product related query', message: 'Hi! I have a query about one of your Daluxe products. Could you help me?' },
  { label: 'I have a doubt', message: 'Hi! I need some assistance from the Daluxe team. Can you help?' },
];

// WhatsApp SVG as data URI for the FAB icon
const WA_ICON_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.122 1.532 5.85L.06 23.41a.75.75 0 00.919.919l5.56-1.472A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 01-4.95-1.357l-.356-.211-3.692.977.978-3.579-.232-.368A9.713 9.713 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>';

export default function WhatsAppButton() {
  if (Platform.OS !== 'web') return null;

  const [open, setOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<any>(null);

  useEffect(() => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();
    return () => pulseRef.current?.stop();
  }, []);

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    setOpen(!open);
    Animated.spring(scaleAnim, {
      toValue,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  };

  const openWhatsApp = (message: string) => {
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    (window as any).open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
    scaleAnim.setValue(0);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {open && (
        <>
          <Pressable style={styles.backdrop} onPress={toggleMenu} />
          <Animated.View
            style={[
              styles.menu,
              {
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
                opacity: scaleAnim,
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>DA</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>Daluxe Support</Text>
                <Text style={styles.menuSubtitle}>Usually replies in minutes</Text>
              </View>
            </View>

            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>Hi there! 👋 How can we help you today?</Text>
            </View>

            <View style={styles.templatesContainer}>
              {TEMPLATES.map((t, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.templateBtn}
                  onPress={() => openWhatsApp(t.message)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.templateText}>{t.label}</Text>
                  <Text style={styles.templateArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.menuFooter}>
              <Text style={styles.footerText}>Powered by WhatsApp</Text>
            </View>
          </Animated.View>
        </>
      )}

      {/* FAB */}
      <Animated.View style={{ transform: [{ scale: open ? 1 : pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.fab, open && styles.fabOpen]}
          onPress={toggleMenu}
          activeOpacity={0.9}
        >
          {open ? (
            <Text style={styles.closeX}>✕</Text>
          ) : (
            <Image
              source={{ uri: WA_ICON_URI }}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const isMobile = SW < 768;

const styles = StyleSheet.create({
  container: {
    position: 'fixed' as any,
    bottom: isMobile ? 88 : 24,
    right: 20,
    zIndex: 9998,
    alignItems: 'flex-end',
  },
  backdrop: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    width: isMobile ? 260 : 300,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
      } as any,
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#075E54',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  menuTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  menuSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 1,
  },
  chatBubble: {
    margin: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    borderTopLeftRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  chatText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  templatesContainer: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 6,
  },
  templateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e7f8ee',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#c3ecd1',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  templateText: {
    fontSize: 13,
    color: '#075E54',
    fontWeight: '600',
    flex: 1,
  },
  templateArrow: {
    fontSize: 18,
    color: '#25D366',
    fontWeight: '700',
  },
  menuFooter: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(37,211,102,0.55)',
        cursor: 'pointer',
      } as any,
    }),
  },
  fabOpen: {
    backgroundColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(0,0,0,0.25)' } as any,
    }),
  },
  closeX: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
});
