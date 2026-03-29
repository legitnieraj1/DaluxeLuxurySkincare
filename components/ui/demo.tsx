'use client';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

// ═══════════════════════════════════════════════
// COLOR PALETTE (from code.html)
// ═══════════════════════════════════════════════
const C = {
  background: '#FDFBF7',
  surfaceContainerLowest: '#FDFBF7',
  surfaceContainer: '#FAF9F6',
  surfaceContainerHigh: '#F4EFEA',
  onSurface: '#1A1A1A',
  onSurfaceVariant: 'rgba(26,26,26,0.7)',
  primary: '#e9c349',
  onPrimary: '#1A1A1A',
  outlineVariant: 'rgba(0,0,0,0.1)',
  tertiary: '#95d1ce',
  tertiaryContainer: '#F4EFEA',
};

const SERIF = Platform.select({
  web: '"Noto Serif", Georgia, "Times New Roman", serif',
  default: undefined,
});
const SANS = Platform.select({
  web: '"Manrope", -apple-system, BlinkMacSystemFont, sans-serif',
  default: undefined,
});

// ═══════════════════════════════════════════════
// GOOGLE ICON SVG
// ═══════════════════════════════════════════════
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════
export function Demo({ onSkip }: { onSkip?: () => void }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // Animated gold glow pulse on the button
  const glowOpacity = useSharedValue(0.15);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    ...Platform.select({
      web: {
        boxShadow: `0 0 40px -10px rgba(233, 195, 73, ${glowOpacity.value})`,
      } as any,
    }),
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity.value,
    shadowRadius: 25,
  }));

  const handleLogin = () => {
    console.log('Login attempt with:', identifier, password);
  };

  return (
    <View style={s.root}>
      {/* ═══ LEFT SIDE: Cinematic Visual ═══ */}
      {isDesktop && (
        <View style={s.leftPanel}>
          {/* Background Image */}
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSkMu1P6bRgj405gsojScPrybk8mxP_O-fPNVrq7rjPVT8TCnihkVwhmUXP-CoqXqMjwbWribHxjdv21F7VTDlwMxSkQFi-RlD2vOvkzid35n4wL0zxvRvyQv7fBKR9HYSzWEpjQCUOL5ppfDgr3hph4cuPQCjhf-BpCuKNoU6TG_yUJQBC016CGKx0lIfppwNl0Js0mIUNayv1y14qb_tDBQhZ-RRSvPOlgSjiu44WSQ0ISfWQAHUjp5sESH6YGMuKbXm4NhjYMI' }}
            style={s.leftBgImage}
            resizeMode="cover"
          />
          {/* Dark gradient overlay */}
          <LinearGradient
            colors={['rgba(253,251,247,0.75)', 'rgba(244,239,234,0.3)', 'transparent']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['rgba(253,251,247,0.6)', 'transparent', 'rgba(233,195,73,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Content */}
          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={s.leftContent}>
            <Text style={s.leftTitle}>Better Skin</Text>
            <Text style={s.leftTitleAccent}>Starts Here</Text>
            <View style={s.leftDescBorder}>
              <Text style={s.leftDesc}>
                Discover skincare that works. Simple, effective, and designed for real results. Start your glow journey with Daluxe.
              </Text>
            </View>
          </Animated.View>

          {/* Ambient glow blob */}
          <View style={s.leftGlowBlob} />
        </View>
      )}

      {/* ═══ RIGHT SIDE: Form Area ═══ */}
      <ScrollView
        style={[s.rightPanel, !isDesktop && { width: '100%' }]}
        contentContainerStyle={s.rightContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Skip Button */}
        <TouchableOpacity onPress={onSkip} style={s.skipBtn}>
          <Text style={s.skipText}>SKIP</Text>
          <ChevronRight color={C.onSurfaceVariant} size={14} />
        </TouchableOpacity>

        {/* Brand Logo */}
        <Animated.View entering={FadeIn.delay(100).duration(600)} style={s.brandSection}>
          <Image
            source={require('../../assets/logo.png')}
            style={s.brandLogo}
            resizeMode="contain"
          />
          <Text style={s.brandSubtitle}>LUMINOUS SANCTUARY</Text>
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={s.welcomeSection}>
          <Text style={s.welcomeTitle}>Welcome Back</Text>
          <Text style={s.welcomeSubtitle}>Enter your credentials to access your profile</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={s.formSection}>
          <Text style={s.inputLabel}>ENTER YOUR EMAIL ADDRESS</Text>
          <TextInput
            style={[
              s.textInput,
              inputFocused && s.textInputFocused,
            ]}
            placeholder="e.g. sanctuary@daluxe.com"
            placeholderTextColor="rgba(191,200,199,0.4)"
            value={identifier}
            onChangeText={setIdentifier}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {/* Focus underline */}
          <View style={[s.focusLine, inputFocused && s.focusLineActive]} />

          {/* Password Field */}
          <Text style={[s.inputLabel, { marginTop: 24 }]}>PASSWORD</Text>
          <TextInput
            style={[
              s.textInput,
              passwordFocused && s.textInputFocused,
            ]}
            placeholder="Enter your password"
            placeholderTextColor="rgba(191,200,199,0.4)"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            secureTextEntry
            autoCapitalize="none"
          />
          {/* Focus underline */}
          <View style={[s.focusLine, passwordFocused && s.focusLineActive]} />

          {/* Gold Login Button */}
          <Animated.View style={glowStyle}>
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.85}>
              <LinearGradient
                colors={['#e9c349', '#524000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.loginBtn}
              >
                <Text style={s.loginBtnText}>LOGIN / SIGN IN</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Divider */}
        <Animated.View entering={FadeIn.delay(400).duration(600)} style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>OR CONTINUE WITH</Text>
          <View style={s.dividerLine} />
        </Animated.View>

        {/* Google Button */}
        <Animated.View entering={FadeInUp.delay(450).duration(600)}>
          <TouchableOpacity style={s.googleBtn} activeOpacity={0.75}>
            <GoogleIcon />
            <Text style={s.googleBtnText}>Google</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Terms */}
        <Animated.View entering={FadeIn.delay(500).duration(600)} style={s.termsRow}>
          <Text style={s.termsText}>
            BY SIGNING IN, YOU AGREE TO OUR{' '}
            <Text style={s.termsLink}>TERMS</Text> &{' '}
            <Text style={s.termsLink}>PRIVACY POLICY</Text>
          </Text>
        </Animated.View>

        {/* Footer */}
        <View style={s.footerSection}>
          <Text style={s.footerText}>Elevating the essence of beauty since 2024</Text>
        </View>
      </ScrollView>

      {/* ═══ Ambient Accent Glows ═══ */}
      <View style={s.ambientContainer} pointerEvents="none">
        <View style={s.ambientGold} />
        <View style={s.ambientTeal} />
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
const s = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.background,
    minHeight: '100%',
  } as any,

  // ── Left Panel ──
  leftPanel: {
    width: '50%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  } as any,
  leftBgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  } as any,
  leftContent: {
    position: 'relative',
    zIndex: 10,
    paddingHorizontal: 64,
    maxWidth: 600,
  },
  leftTitle: {
    fontSize: 68,
    color: C.onSurface,
    fontWeight: '300',
    lineHeight: 76,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  leftTitleAccent: {
    fontSize: 72,
    color: C.primary,
    fontWeight: '300',
    fontStyle: 'italic',
    lineHeight: 80,
    marginBottom: 32,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  leftDescBorder: {
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(233,195,73,0.3)',
    paddingLeft: 24,
    maxWidth: 420,
  },
  leftDesc: {
    fontSize: 17,
    color: C.onSurfaceVariant,
    lineHeight: 28,
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },
  leftGlowBlob: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(233,195,73,0.08)',
    ...Platform.select({
      web: { filter: 'blur(100px)' } as any,
    }),
  },

  // ── Right Panel ──
  rightPanel: {
    flex: 1,
    backgroundColor: C.surfaceContainerLowest,
  },
  rightContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingVertical: 60,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  } as any,

  // ── Skip ──
  skipBtn: {
    position: 'absolute',
    top: 32,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 20,
  } as any,
  skipText: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    letterSpacing: 3,
    fontWeight: '500',
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

  // ── Brand ──
  brandSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brandLogo: {
    width: 56,
    height: 56,
    marginBottom: 12,
  },
  brandSubtitle: {
    fontSize: 10,
    color: C.primary,
    letterSpacing: 6,
    fontWeight: '400',
    opacity: 0.8,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },

  // ── Welcome ──
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  welcomeTitle: {
    fontSize: 30,
    color: C.onSurface,
    fontWeight: '400',
    marginBottom: 8,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

  // ── Form ──
  formSection: {
    width: '100%',
    marginBottom: 16,
  } as any,
  inputLabel: {
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 3,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 2,
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },
  textInput: {
    width: '100%',
    backgroundColor: C.surfaceContainer,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63,73,72,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: C.onSurface,
    ...Platform.select({
      web: {
        fontFamily: SANS,
        outlineStyle: 'none',
        transition: 'border-color 0.5s ease',
      } as any,
    }),
  } as any,
  textInputFocused: {
    borderBottomColor: C.primary,
  },
  focusLine: {
    height: 1,
    width: '0%',
    backgroundColor: C.primary,
    ...Platform.select({
      web: { transition: 'width 0.7s ease' } as any,
    }),
  } as any,
  focusLineActive: {
    width: '100%',
  } as any,
  loginBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    borderRadius: 2,
  } as any,
  loginBtnText: {
    fontSize: 13,
    color: C.onPrimary,
    fontWeight: '600',
    letterSpacing: 4,
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingVertical: 20,
  } as any,
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dividerText: {
    fontSize: 10,
    color: 'rgba(26,26,26,0.5)',
    letterSpacing: 3,
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

  // ── Google ──
  googleBtn: {
    width: '100%',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,73,72,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 2,
  } as any,
  googleBtnText: {
    fontSize: 14,
    color: C.onSurface,
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

  // ── Terms ──
  termsRow: {
    marginTop: 40,
    width: '100%',
  } as any,
  termsText: {
    fontSize: 10,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 18,
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },
  termsLink: {
    color: C.onSurface,
    textDecorationLine: 'underline',
  },

  // ── Footer ──
  footerSection: {
    marginTop: 60,
    opacity: 0.3,
  },
  footerText: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontStyle: 'italic',
    letterSpacing: 3,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },

  // ── Ambient Accents ──
  ambientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: -1,
  },
  ambientGold: {
    position: 'absolute',
    top: '25%',
    right: -96,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(233,195,73,0.04)',
    ...Platform.select({
      web: { filter: 'blur(120px)' } as any,
    }),
  } as any,
  ambientTeal: {
    position: 'absolute',
    bottom: -96,
    left: -96,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(149,209,206,0.04)',
    ...Platform.select({
      web: { filter: 'blur(120px)' } as any,
    }),
  } as any,
});
