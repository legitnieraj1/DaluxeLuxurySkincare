'use client';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image,
  StyleSheet,
  Platform,
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
export function Demo({ onSkip, onSuccess }: { onSkip?: () => void, onSuccess?: () => void }) {
  const [hoverCTA, setHoverCTA] = useState(false);
  const [hoverTerms, setHoverTerms] = useState(false);
  const [hoverPrivacy, setHoverPrivacy] = useState(false);

  // Auth States
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const shimmerOpacity = useSharedValue(0.1);
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

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    // dynamically import to avoid breaking react native build if needed, but App.tsx handles it
    const { supabaseClient } = require('../../lib/supabaseClient');
    const { error } = await supabaseClient.auth.signInWithOtp({ email });
    setIsLoading(false);
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      setShowOtp(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setErrorMsg('Please enter the 6-digit code sent to your email.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    const { supabaseClient } = require('../../lib/supabaseClient');
    const { data, error } = await supabaseClient.auth.verifyOtp({ email, token: otp, type: 'email' });
    setIsLoading(false);
    
    if (error) {
       setErrorMsg(error.message);
    } else if (data.session) {
       onSuccess && onSuccess();
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { supabaseClient } = require('../../lib/supabaseClient');
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: origin ? `${origin}/profile` : undefined }
    });
    if (error) setErrorMsg(error.message);
    setIsLoading(false); // only matters if it fails to redirect
  };

  return (
    <View style={s.root}>
      {/* Luxury noise texture */}
      {Platform.OS === 'web' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.025'/%3E%3C/svg%3E")`
        }} />
      )}
      <Animated.View entering={FadeIn.duration(1200)} style={StyleSheet.absoluteFillObject} pointerEvents="none">
         {Platform.OS === 'web' && <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(0px)', transition: 'backdrop-filter 1.2s ease-out', animation: 'loadBlur 1s ease-out forwards' }} />}
      </Animated.View>
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{ __html: `@keyframes loadBlur { from { backdrop-filter: blur(20px); } to { backdrop-filter: blur(0px); } }` }} />
      )}

      {/* Left Side: Desktop visual */}
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

      {/* Mobile background */}
      {!isDesktop && (
        <View style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]}>
           <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSkMu1P6bRgj405gsojScPrybk8mxP_O-fPNVrq7rjPVT8TCnihkVwhmUXP-CoqXqMjwbWribHxjdv21F7VTDlwMxSkQFi-RlD2vOvkzid35n4wL0zxvRvyQv7fBKR9HYSzWEpjQCUOL5ppfDgr3hph4cuPQCjhf-BpCuKNoU6TG_yUJQBC016CGKx0lIfppwNl0Js0mIUNayv1y14qb_tDBQhZ-RRSvPOlgSjiu44WSQ0ISfWQAHUjp5sESH6YGMuKbXm4NhjYMI' }} style={{ width: '100%', height: '100%', opacity: 0.6 } as any} blurRadius={20} resizeMode="cover" />
           <LinearGradient colors={['rgba(248,246,242,0.6)', 'rgba(242,239,234,0.9)']} style={StyleSheet.absoluteFillObject} />
        </View>
      )}

      {/* Right Side: Auth */}
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
             <Text style={s.welcomeTitle}>Welcome</Text>
             <Text style={s.welcomeSubtitle}>Sign in to access your sanctuary</Text>
           </Animated.View>
           
           {/* Email Form */}
           <Animated.View entering={FadeInUp.delay(400).duration(800)} style={{ width: '100%', marginBottom: 20 }}>
             {!showOtp ? (
               <View>
                 {Platform.OS === 'web' ? (
                   <input
                     type="email"
                     placeholder="Email Address"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     disabled={isLoading}
                     style={inputStyle}
                   />
                 ) : (
                   <Text>Email input requires Web Platform in this snippet</Text>
                 )}
                 <TouchableOpacity onPress={handleSendOtp} disabled={isLoading} style={s.primaryBtn}>
                   <Text style={s.primaryBtnText}>{isLoading ? 'SENDING...' : 'CONTINUE WITH EMAIL'}</Text>
                 </TouchableOpacity>
               </View>
             ) : (
               <View>
                 <Text style={{ textAlign: 'center', fontSize: 13, color: '#6E6E6E', marginBottom: 12, ...Platform.select({ web: { fontFamily: SANS } as any }) }}>
                   Code sent to {email}. <Text onPress={() => setShowOtp(false)} style={{ color: '#D4AF37', cursor: 'pointer' } as any}>Edit</Text>
                 </Text>
                 {Platform.OS === 'web' ? (
                   <input
                     type="text"
                     placeholder="6-Digit OTP"
                     value={otp}
                     onChange={(e) => setOtp(e.target.value)}
                     disabled={isLoading}
                     style={inputStyle}
                   />
                 ) : (
                   <Text>OTP input unsupported</Text>
                 )}
                 <TouchableOpacity onPress={handleVerifyOtp} disabled={isLoading} style={s.primaryBtn}>
                   <Text style={s.primaryBtnText}>{isLoading ? 'VERIFYING...' : 'SIGN IN'}</Text>
                 </TouchableOpacity>
               </View>
             )}
             {errorMsg ? <Text style={{ color: 'red', fontSize: 12, textAlign: 'center', marginTop: 10, ...Platform.select({ web: { fontFamily: SANS } as any }) }}>{errorMsg}</Text> : null}
           </Animated.View>

           {/* Divider */}
           <Animated.View entering={FadeInUp.delay(500).duration(800)} style={s.dividerRow}>
             <View style={s.dividerLine} />
             <Text style={s.dividerText}>OR</Text>
             <View style={s.dividerLine} />
           </Animated.View>

           {/* Google Sign-In CTA */}
           <Animated.View entering={FadeInUp.delay(600).duration(800)} style={s.ctaContainer}>
             <Animated.View style={[s.ctaGlow, ctaGlowStyle]} />
             <Pressable
               onHoverIn={() => setHoverCTA(true)}
               onHoverOut={() => setHoverCTA(false)}
               onPress={handleGoogleLogin}
               disabled={isLoading}
             >
               {({ pressed }: { pressed: boolean }) => (
                 <Animated.View style={[s.loginBtnScale, { transform: [{ scale: pressed ? 0.98 : (hoverCTA ? 1.02 : 1) }] }]}>
                   <LinearGradient colors={['#D4AF37', '#B8962E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.loginBtnGradient}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 } as any}>
                       <GoogleIcon />
                       <Text style={s.loginBtnText}>CONTINUE WITH GOOGLE</Text>
                     </View>
                   </LinearGradient>
                 </Animated.View>
               )}
             </Pressable>
           </Animated.View>

           {/* Terms */}
           <Animated.View entering={FadeInUp.delay(850).duration(800)} style={s.termsRow}>
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
           <Animated.View entering={FadeIn.delay(950).duration(800)} style={s.footerSection}>
             <Text style={s.footerText}>Elevating the essence of beauty since 2024</Text>
           </Animated.View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const inputStyle = {
  width: '100%',
  padding: '16px 20px',
  borderRadius: '10px',
  border: '1px solid rgba(0,0,0,0.1)',
  backgroundColor: 'rgba(255,255,255,0.5)',
  fontSize: '14px',
  marginBottom: '16px',
  outline: 'none',
  fontFamily: SANS,
} as any;

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

  rightPanel: {
    flex: 1,
    backgroundColor: 'transparent',
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

  skipBtn: {
    position: 'absolute',
    top: 0,
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
    marginLeft: 10,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },

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

  primaryBtn: {
    width: '100%',
    backgroundColor: '#0F2F46',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  primaryBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 3,
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

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
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  dividerText: {
    fontSize: 10,
    color: '#A0A0A0',
    letterSpacing: 8,
    fontWeight: '500',
    ...Platform.select({ web: { fontFamily: SANS } as any }),
  },

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
