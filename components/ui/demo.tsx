'use client';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
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
// COLOR PALETTE & CONSTANTS
// ═══════════════════════════════════════════════
const C = {
  background: '#F8F6F2',
  surfaceContainerLowest: '#F8F6F2',
  surfaceContainer: '#F2EFEA',
  onSurface: '#1A1A1A',
  onSurfaceVariant: '#6E6E6E',
  primary: '#D4AF37',
  onPrimary: '#FFFFFF',
  outlineVariant: 'rgba(0,0,0,0.1)',
  goldMuted: '#A39171',
};

const SERIF = Platform.select({
  web: '"Playfair Display", "Canela", "Noto Serif", Georgia, serif',
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
export function Demo({ onSkip, onLogin }: { onSkip?: () => void, onLogin?: (email: string) => void }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [hoverForgot, setHoverForgot] = useState(false);
  const [hoverCTA, setHoverCTA] = useState(false);
  const [hoverGoogle, setHoverGoogle] = useState(false);
  const [hoverTerms, setHoverTerms] = useState(false);
  const [hoverPrivacy, setHoverPrivacy] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // Animated gold shimmer pulse for logo
  const shimmerOpacity = useSharedValue(0.1);
  // Animated CTA glow pulse
  const ctaGlowOpacity = useSharedValue(0.4);

  useEffect(() => {
    shimmerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    ctaGlowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  const ctaGlowStyle = useAnimatedStyle(() => ({
    opacity: hoverCTA ? 1 : ctaGlowOpacity.value,
    transform: [{ scale: hoverCTA ? 1.05 : 1 }],
  }));

  const handleLogin = () => {
    if (!identifier || !identifier.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    // Simulate auth token generation
    if (onLogin) onLogin(identifier.toLowerCase().trim());
  };

  return (
    <View style={s.root}>
      {/* ═══ LUXURY NOISE TEXTURE ═══ */}
      {Platform.OS === 'web' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.025'/%3E%3C/svg%3E")`
        }} />
      )}
      {/* Soft Page Load Blur Transition */}
      <Animated.View entering={FadeIn.duration(1200)} style={StyleSheet.absoluteFillObject} pointerEvents="none">
         {Platform.OS === 'web' && <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(0px)', transition: 'backdrop-filter 1.2s ease-out', animation: 'loadBlur 1s ease-out forwards' }} />}
      </Animated.View>
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{ __html: `@keyframes loadBlur { from { backdrop-filter: blur(20px); } to { backdrop-filter: blur(0px); } }` }} />
      )}

      {/* ═══ LEFT SIDE: Cinematic Visual ═══ */}
      {isDesktop && (
        <View style={s.leftPanel}>
          <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSkMu1P6bRgj405gsojScPrybk8mxP_O-fPNVrq7rjPVT8TCnihkVwhmUXP-CoqXqMjwbWribHxjdv21F7VTDlwMxSkQFi-RlD2vOvkzid35n4wL0zxvRvyQv7fBKR9HYSzWEpjQCUOL5ppfDgr3hph4cuPQCjhf-BpCuKNoU6TG_yUJQBC016CGKx0lIfppwNl0Js0mIUNayv1y14qb_tDBQhZ-RRSvPOlgSjiu44WSQ0ISfWQAHUjp5sESH6YGMuKbXm4NhjYMI' }} style={s.leftBgImage} resizeMode="cover" />
          <LinearGradient colors={['rgba(248,246,242,0.8)', 'rgba(242,239,234,0.3)', 'transparent']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
          <LinearGradient colors={['rgba(248,246,242,0.7)', 'transparent', 'rgba(212,175,55,0.08)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
          
          <Animated.View entering={FadeInDown.delay(200).duration(1000)} style={s.leftContent}>
            <Text style={s.leftTitle}>Quiet Luxury,</Text>
            <Text style={s.leftTitleAccent}>Refined Skin</Text>
            <View style={s.leftDescBorder}>
               <Text style={s.leftDesc}>Enter the sanctuary. Discover formulations guided by dermal-science and botanical perfection.</Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* ═══ MOBILE BACKGROUND LAYER ═══ */}
      {!isDesktop && (
        <View style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]}>
           <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSkMu1P6bRgj405gsojScPrybk8mxP_O-fPNVrq7rjPVT8TCnihkVwhmUXP-CoqXqMjwbWribHxjdv21F7VTDlwMxSkQFi-RlD2vOvkzid35n4wL0zxvRvyQv7fBKR9HYSzWEpjQCUOL5ppfDgr3hph4cuPQCjhf-BpCuKNoU6TG_yUJQBC016CGKx0lIfppwNl0Js0mIUNayv1y14qb_tDBQhZ-RRSvPOlgSjiu44WSQ0ISfWQAHUjp5sESH6YGMuKbXm4NhjYMI' }} style={{ width: '100%', height: '100%', opacity: 0.6 }} blurRadius={20} resizeMode="cover" />
           <LinearGradient colors={['rgba(248,246,242,0.6)', 'rgba(242,239,234,0.9)']} style={StyleSheet.absoluteFillObject} />
        </View>
      )}

      {/* ═══ RIGHT SIDE: Form Area ═══ */}
      <ScrollView
        style={[s.rightPanel, !isDesktop && s.rightPanelMobile]}
        contentContainerStyle={[s.rightContent, !isDesktop && s.rightContentMobile]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={[isDesktop ? s.formContainerDesk : s.formContainerMob]}>
           
           {/* Skip Button */}
           <TouchableOpacity onPress={onSkip} style={s.skipBtn}>
             <Text style={s.skipText}>SKIP</Text>
             <ChevronRight color={C.onSurfaceVariant} size={14} />
           </TouchableOpacity>

           {/* Brand Logo */}
           <Animated.View entering={FadeInDown.delay(200).duration(800)} style={s.brandSection}>
             <View style={s.logoWrapper}>
               <Animated.View style={[s.logoGlow, shimmerStyle]} />
               <Image source={require('../../assets/logo.png')} style={s.brandLogo} resizeMode="contain" />
             </View>
             <Text style={s.brandSubtitle}>LUMINOUS SANCTUARY</Text>
           </Animated.View>

           {/* Welcome Text */}
           <Animated.View entering={FadeInUp.delay(300).duration(800)} style={s.welcomeSection}>
             <Text style={s.welcomeTitle}>Welcome Back</Text>
             <Text style={s.welcomeSubtitle}>Enter your credentials to access your profile</Text>
           </Animated.View>

           {/* Form Inputs */}
           <View style={{ width: '100%' }}>
             {/* Email Container */}
             <Animated.View entering={FadeInUp.delay(400).duration(800)} style={s.inputContainer}>
               <Text style={s.inputLabel}>EMAIL ADDRESS</Text>
               <View style={[s.inputWrapper, inputFocused && s.inputWrapperFocused]}>
                 <TextInput
                   style={[s.textInput, { fontStyle: identifier ? 'normal' : 'italic' }]}
                   placeholder="e.g. sanctuary@daluxe.com"
                   placeholderTextColor="rgba(110,110,110,0.5)"
                   value={identifier}
                   onChangeText={setIdentifier}
                   onFocus={() => setInputFocused(true)}
                   onBlur={() => setInputFocused(false)}
                   autoCapitalize="none"
                   keyboardType="email-address"
                 />
                 <View style={[s.focusLine, inputFocused && s.focusLineActive]} />
               </View>
             </Animated.View>

             {/* Password Container */}
             <Animated.View entering={FadeInUp.delay(500).duration(800)} style={s.inputContainer}>
               <Text style={s.inputLabel}>PASSWORD</Text>
               <View style={[s.inputWrapper, passwordFocused && s.inputWrapperFocused]}>
                 <TextInput
                   style={[s.textInput, { fontStyle: password ? 'normal' : 'italic' }]}
                   placeholder="Enter your password"
                   placeholderTextColor="rgba(110,110,110,0.5)"
                   value={password}
                   onChangeText={setPassword}
                   onFocus={() => setPasswordFocused(true)}
                   onBlur={() => setPasswordFocused(false)}
                   secureTextEntry
                   autoCapitalize="none"
                 />
                 <View style={[s.focusLine, passwordFocused && s.focusLineActive]} />
               </View>
             </Animated.View>

             {/* Forgot Password */}
             <Animated.View entering={FadeInUp.delay(550).duration(800)} style={s.forgotPwdRow}>
               <Pressable 
                  onHoverIn={() => setHoverForgot(true)} 
                  onHoverOut={() => setHoverForgot(false)}
                  style={s.forgotPwdPress}
               >
                 <Text style={[s.forgotPwdText, hoverForgot && s.forgotPwdTextHover]}>Forgot password?</Text>
                 <View style={[s.forgotPwdLine, hoverForgot && s.forgotPwdLineHover]} />
               </Pressable>
             </Animated.View>

             {/* Gold Login CTA */}
             <Animated.View entering={FadeInUp.delay(650).duration(800)} style={s.ctaContainer}>
               <Animated.View style={[s.ctaGlow, ctaGlowStyle]} />
               <Pressable
                 onHoverIn={() => setHoverCTA(true)}
                 onHoverOut={() => setHoverCTA(false)}
                 onPress={handleLogin}
               >
                 {({ pressed }) => (
                   <Animated.View style={[s.loginBtnScale, { transform: [{ scale: pressed ? 0.98 : (hoverCTA ? 1.02 : 1) }] }]}>
                     <LinearGradient colors={['#D4AF37', '#B8962E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.loginBtnGradient}>
                       <Text style={s.loginBtnText}>LOGIN / SIGN IN</Text>
                     </LinearGradient>
                   </Animated.View>
                 )}
               </Pressable>
             </Animated.View>
           </View>

           {/* Divider */}
           <Animated.View entering={FadeInUp.delay(750).duration(800)} style={s.dividerRow}>
             <View style={s.dividerLine} />
             <Text style={s.dividerText}>OR CONTINUE WITH</Text>
             <View style={s.dividerLine} />
           </Animated.View>

           {/* Google Auth */}
           <Animated.View entering={FadeInUp.delay(850).duration(800)} style={{ width: '100%' }}>
             <Pressable
               onHoverIn={() => setHoverGoogle(true)}
               onHoverOut={() => setHoverGoogle(false)}
             >
               {({ pressed }) => (
                 <View style={[s.googleBtn, hoverGoogle && s.googleBtnHover, pressed && s.googleBtnPressed]}>
                   <GoogleIcon />
                   <Text style={s.googleBtnText}>Continue with Google</Text>
                 </View>
               )}
             </Pressable>
           </Animated.View>

           {/* Terms */}
           <Animated.View entering={FadeInUp.delay(950).duration(800)} style={s.termsRow}>
             <Text style={s.termsText}>
               BY SIGNING IN, YOU AGREE TO OUR{' '}
               <Pressable onHoverIn={() => setHoverTerms(true)} onHoverOut={() => setHoverTerms(false)}>
                 <Text style={[s.termsLink, hoverTerms && s.termsLinkHover]}>TERMS</Text>
               </Pressable>
               {' '}&{' '}
               <Pressable onHoverIn={() => setHoverPrivacy(true)} onHoverOut={() => setHoverPrivacy(false)}>
                 <Text style={[s.termsLink, hoverPrivacy && s.termsLinkHover]}>PRIVACY POLICY</Text>
               </Pressable>
             </Text>
           </Animated.View>

           {/* Footer */}
           <Animated.View entering={FadeIn.delay(1050).duration(800)} style={s.footerSection}>
             <Text style={s.footerText}>Elevating the essence of beauty since 2024</Text>
           </Animated.View>

        </Animated.View>
      </ScrollView>
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
    zIndex: 2,
  } as any,

  // ── Left Panel (Desktop) ──
  leftPanel: {
    width: '55%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  } as any,
  leftBgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  } as any,
  leftContent: {
    position: 'relative',
    zIndex: 10,
    paddingHorizontal: 64,
    maxWidth: 600,
    alignItems: 'flex-start',
  },
  leftTitle: {
    fontSize: 56,
    color: '#1A1A1A',
    fontWeight: '300',
    lineHeight: 64,
    letterSpacing: 2,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  leftTitleAccent: {
    fontSize: 64,
    color: '#B8962E',
    fontWeight: '300',
    fontStyle: 'italic',
    lineHeight: 74,
    marginBottom: 32,
    letterSpacing: 1,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  leftDescBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(212,175,55,0.4)',
    paddingLeft: 24,
    maxWidth: 400,
  },
  leftDesc: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 26,
    fontWeight: '300',
    letterSpacing: 0.5,
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

  // ── Right Panel ──
  rightPanel: {
    flex: 1,
    backgroundColor: 'transparent', // controlled by gradients
    zIndex: 3,
  },
  rightPanelMobile: {
    width: '100%',
  },
  rightContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  } as any,
  rightContentMobile: {
    paddingHorizontal: 16,
  },

  // ── Form Container ──
  formContainerDesk: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  formContainerMob: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Platform.select({
       web: { backdropFilter: 'blur(30px)', boxShadow: '0 20px 60px rgba(0,0,0,0.06)' } as any
    }),
  },

  // ── Skip ──
  skipBtn: {
    position: 'absolute',
    top: 0, // absolute within formContainer
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 20,
    padding: 10,
  } as any,
  skipText: {
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 4,
    fontWeight: '600',
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

  // ── Brand ──
  brandSection: {
    alignItems: 'center',
    marginBottom: 44,
    marginTop: 20,
  },
  logoWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#D4AF37',
    borderRadius: 30,
    ...Platform.select({ web: { filter: 'blur(20px)' } as any }),
  },
  brandLogo: {
    width: 48,
    height: 48,
    marginBottom: 0,
    zIndex: 2,
  },
  brandSubtitle: {
    fontSize: 9,
    color: '#8A7A5D',
    letterSpacing: 10,
    fontWeight: '500',
    marginTop: 18,
    marginLeft: 10, // offset letterspacing visual
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },

  // ── Welcome ──
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 44,
  },
  welcomeTitle: {
    fontSize: 36,
    color: '#1A1A1A',
    fontWeight: '400',
    lineHeight: 42,
    marginBottom: 10,
    letterSpacing: 0.5,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    fontWeight: '300',
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

  // ── Inputs ──
  inputContainer: {
    width: '100%',
    marginBottom: 26,
  },
  inputLabel: {
    fontSize: 10,
    color: C.goldMuted,
    letterSpacing: 4,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(163,145,113,0.2)',
    ...Platform.select({ web: { transition: 'box-shadow 0.4s ease' } as any }),
  },
  inputWrapperFocused: {
    ...Platform.select({ web: { boxShadow: '0 10px 30px -15px rgba(212,175,55,0.15)' } as any }),
  },
  textInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 4,
    fontSize: 16,
    color: C.onSurface,
    fontWeight: '400',
    ...Platform.select({
      web: { fontFamily: SANS, outlineStyle: 'none' } as any,
    }),
  } as any,
  focusLine: {
    position: 'absolute',
    bottom: -1,
    left: '50%',
    height: 1.5,
    width: '0%',
    backgroundColor: '#D4AF37',
    transform: [{ translateX: '-50%' }],
    ...Platform.select({ web: { transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' } as any }),
  } as any,
  focusLineActive: {
    width: '100%',
  } as any,

  // ── Forgot Password ──
  forgotPwdRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 36,
    marginTop: -8,
  },
  forgotPwdPress: {
    paddingVertical: 6,
    paddingLeft: 12,
  },
  forgotPwdText: {
    fontSize: 12,
    color: '#8A8A8A',
    fontWeight: '400',
    letterSpacing: 0.5,
    ...Platform.select({ web: { fontFamily: SANS, transition: 'color 0.3s ease' } as any }),
  },
  forgotPwdTextHover: {
    color: '#B8962E',
  },
  forgotPwdLine: {
    height: 1,
    width: '0%',
    backgroundColor: '#B8962E',
    marginTop: 2,
    ...Platform.select({ web: { transition: 'width 0.4s ease' } as any }),
  },
  forgotPwdLineHover: {
    width: '100%',
  },

  // ── CTA Button ──
  ctaContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 10,
  },
  ctaGlow: {
    position: 'absolute',
    top: 4, left: 10, right: 10, bottom: -4,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    ...Platform.select({ web: { filter: 'blur(16px)', transition: 'all 0.4s ease' } as any }),
  },
  loginBtnScale: {
    width: '100%',
    ...Platform.select({ web: { transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' } as any }),
  },
  loginBtnGradient: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  loginBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 4,
    ...Platform.select({ web: { fontFamily: SANS, textShadow: '0 2px 10px rgba(0,0,0,0.1)' } as any }),
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingVertical: 32,
  } as any,
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  dividerText: {
    fontSize: 10,
    color: '#A0A0A0',
    letterSpacing: 8,
    fontWeight: '500',
    marginLeft: 8, // offset letterspacing
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

  // ── Google ──
  googleBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 10,
    ...Platform.select({ web: { boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'all 0.3s ease' } as any }),
  } as any,
  googleBtnHover: {
    borderColor: 'rgba(212,175,55,0.3)',
    ...Platform.select({ web: { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' } as any }),
  },
  googleBtnPressed: {
    ...Platform.select({ web: { transform: 'translateY(1px)', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' } as any }),
  },
  googleBtnText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

  // ── Terms ──
  termsRow: {
    marginTop: 40,
    width: '100%',
    opacity: 0.6,
  } as any,
  termsText: {
    fontSize: 9,
    color: '#6E6E6E',
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 18,
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },
  termsLink: {
    color: '#1A1A1A',
    fontWeight: '600',
    ...Platform.select({ web: { transition: 'color 0.3s ease' } as any }),
  },
  termsLinkHover: {
    color: '#D4AF37',
  },

  // ── Footer ──
  footerSection: {
    marginTop: 48,
    opacity: 0.4,
  },
  footerText: {
    fontSize: 12,
    color: '#6E6E6E',
    fontStyle: 'italic',
    letterSpacing: 2,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
});
