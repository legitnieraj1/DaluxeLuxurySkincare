import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Platform, Linking, Image,
  Animated as RNAnimated,
} from 'react-native';
import { X } from 'lucide-react-native';

const WA_NUMBER = '918879621636';

// Official WhatsApp logo as inline SVG data URI (works with RN Web Image)
const WA_ICON_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%2325D366'/%3E%3Cpath fill='%23fff' d='M34.3 13.7A14.07 14.07 0 0 0 24 9.5C16.55 9.5 10.5 15.55 10.5 23a13.44 13.44 0 0 0 1.9 6.9L10.5 38.5l8.8-2.3a13.9 13.9 0 0 0 4.7.86h.01C31.45 37.06 37.5 31 37.5 23.5a13.57 13.57 0 0 0-3.2-9.8zm-10.3 21.3a11.55 11.55 0 0 1-5.88-1.61l-.42-.25-4.36 1.14 1.16-4.25-.28-.44a11.48 11.48 0 0 1-1.77-6.14c0-6.35 5.17-11.52 11.54-11.52a11.46 11.46 0 0 1 8.16 3.38 11.47 11.47 0 0 1 3.37 8.17c0 6.36-5.17 11.52-11.52 11.52zm6.32-8.63c-.35-.17-2.05-1.01-2.37-1.13s-.55-.17-.78.17-.9 1.13-1.1 1.36-.4.26-.75.09a9.43 9.43 0 0 1-2.77-1.71 10.4 10.4 0 0 1-1.92-2.38c-.2-.35 0-.53.15-.7s.35-.4.52-.61a2.3 2.3 0 0 0 .35-.58.64.64 0 0 0-.03-.61c-.09-.17-.78-1.88-1.07-2.58s-.57-.58-.78-.59h-.66a1.28 1.28 0 0 0-.93.44 3.9 3.9 0 0 0-1.22 2.9 6.77 6.77 0 0 0 1.42 3.59c.17.23 2.42 3.7 5.87 5.19a19.7 19.7 0 0 0 1.96.72 4.72 4.72 0 0 0 2.16.14 3.58 3.58 0 0 0 2.35-1.66 2.91 2.91 0 0 0 .2-1.66c-.08-.14-.31-.23-.65-.4z'/%3E%3C/svg%3E";

const OPTIONS = [
  {
    id: 'invest',
    emoji: '💼',
    label: 'Invest / Fund our brand',
    message:
      "Hi Daluxe! I'm interested in investing or partnering with your brand. Could you share more details about investment opportunities?",
  },
  {
    id: 'product',
    emoji: '🧴',
    label: 'Product Query',
    message:
      "Hi Daluxe! I have a question about one of your skincare products. Could you help me out?",
  },
  {
    id: 'order',
    emoji: '📦',
    label: 'Order Updates',
    message:
      "Hi Daluxe! I'd like to check on the status of my recent order. Could you please help?",
  },
  {
    id: 'general',
    emoji: '💬',
    label: 'General Inquiry',
    message: "Hi Daluxe! I have a general question. Could you please help me?",
  },
];

const openWhatsApp = (message: string) => {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url);
  }
};

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [scaleAnim] = useState(() => new RNAnimated.Value(0));
  const [fadeAnim] = useState(() => new RNAnimated.Value(0));

  const show = () => {
    setOpen(true);
    RNAnimated.parallel([
      RNAnimated.spring(scaleAnim, {
        toValue: 1, tension: 65, friction: 8, useNativeDriver: true,
      }),
      RNAnimated.timing(fadeAnim, {
        toValue: 1, duration: 160, useNativeDriver: true,
      }),
    ]).start();
  };

  const hide = () => {
    RNAnimated.parallel([
      RNAnimated.spring(scaleAnim, {
        toValue: 0, tension: 80, friction: 10, useNativeDriver: true,
      }),
      RNAnimated.timing(fadeAnim, {
        toValue: 0, duration: 130, useNativeDriver: true,
      }),
    ]).start(() => setOpen(false));
  };

  const toggle = () => (open ? hide() : show());

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* Popup */}
      {open && (
        <RNAnimated.View
          style={[
            styles.panel,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                {
                  translateY: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image source={{ uri: WA_ICON_URI }} style={styles.headerIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Chat with Daluxe</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Typically replies instantly</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={toggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          {/* Greeting bubble */}
          <View style={styles.bubbleRow}>
            <Image source={{ uri: WA_ICON_URI }} style={styles.bubbleAvatar} />
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>
                👋 Hi there! How can we help you today?
              </Text>
            </View>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.optionRow}
                activeOpacity={0.7}
                onPress={() => {
                  hide();
                  setTimeout(() => openWhatsApp(opt.message), 280);
                }}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by </Text>
            <Image source={{ uri: WA_ICON_URI }} style={styles.footerIcon} />
            <Text style={styles.footerText}> WhatsApp Business</Text>
          </View>
        </RNAnimated.View>
      )}

      {/* FAB */}
      <TouchableOpacity onPress={toggle} activeOpacity={0.88} style={styles.fab}>
        {open ? (
          <X size={22} color="#FFF" />
        ) : (
          <Image source={{ uri: WA_ICON_URI }} style={styles.fabIcon} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 96,
    right: 18,
    zIndex: 9999,
    alignItems: 'flex-end',
    ...Platform.select({ web: { position: 'fixed' } as any }),
  },

  /* ── Panel ── */
  panel: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginBottom: 12,
    width: 310,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 8px 48px rgba(0,0,0,0.18)' } as any,
      default: {
        elevation: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
    }),
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#075E54',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerIcon: { width: 40, height: 40, borderRadius: 20 },
  headerTitle: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  onlineText: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },

  /* Greeting bubble */
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 14,
    paddingBottom: 8,
    backgroundColor: '#E5DDD5',
  },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14 },
  bubble: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderBottomLeftRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 9,
    maxWidth: 220,
    ...Platform.select({ web: { boxShadow: '0 1px 2px rgba(0,0,0,0.1)' } as any }),
  },
  bubbleText: { fontSize: 13, color: '#1A1A1A', lineHeight: 19 },

  /* Options */
  optionsList: { backgroundColor: '#FFF' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  optionEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  optionLabel: { flex: 1, fontSize: 13, color: '#1A1A1A', fontWeight: '500' },
  chevron: { fontSize: 20, color: '#25D366', fontWeight: '700', lineHeight: 22 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    backgroundColor: '#F7F7F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  footerIcon: { width: 14, height: 14, borderRadius: 7, marginHorizontal: 2 },
  footerText: { fontSize: 10, color: '#999' },

  /* FAB */
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 24px rgba(37,211,102,0.5)',
        cursor: 'pointer',
      } as any,
      default: {
        elevation: 10,
        shadowColor: '#25D366',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
    }),
  },
  fabIcon: { width: 56, height: 56, borderRadius: 28 },
});
