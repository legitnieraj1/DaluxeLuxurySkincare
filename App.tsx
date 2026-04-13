import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Platform, ScrollView } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  interpolateColor,
  runOnJS,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  useAnimatedReaction
} from 'react-native-reanimated';
import { User, ShoppingCart, ChevronLeft, ChevronRight, Sparkles, Menu, X, Star, ArrowRight, Home, LayoutGrid, MessageCircle, ScanFace } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CollectionPage, { ProductType, CartItem, CartDrawer, COLLECTION_PRODUCTS } from './CollectionPage';
import OurStoryPage from './OurStoryPage';
import SkinAssessmentPage from './SkinAssessmentPage';
import HomeSections from './HomeSections';
import ContactPage from './ContactPage';
import CheckoutPage from './CheckoutPage';
import { Demo as LoginPage } from './components/ui/demo';
import ProfilePage from './ProfilePage';
import { supabaseClient } from './lib/supabaseClient';
import './assets/output.css';

const { height, width } = Dimensions.get('window');
const isMobileStatic = width < 768; // static for StyleSheet

// Dynamic hook-based mobile detection for components
const useIsMobile = () => {
  const { width: w } = require('react-native').useWindowDimensions();
  return w < 768;
};

const PRODUCTS = [
  {
    id: 1,
    title: 'Weightless\nPerfection',
    subtitle: 'Ultra Sensitive Smooth',
    name: 'HAIR SERUM',
    description: 'Dermal-Grade Botanical Formula. Weightless Smoothness, Natural Shine. Zero Silicone Feel. Your hair, perfected.',
    price: '₹349',
    size: '30 ml (1.0 fl oz)',
    theme: { text: '#108cbaff', subText: '#0b0b0bff', accent: '#3d3d3dff', shadow: 'rgba(229, 0, 0, 0.6)', alignClass: 'flex-start', textAlign: 'left' as const },
    benefits: ['Weightless.', 'Natural Shine.', 'Zero Silicone.'],
    image: require('./assets/product2.png'), // Gold bottle
    bgImage: require('./assets/bg_face_serum.png')
  },
  {
    id: 2,
    title: 'Reveal\nYour Glow',
    subtitle: 'Ultra Sensitive Glow & Correct',
    name: 'FACE SERUM',
    description: 'Discover a world of radiant skin with our ultra-sensitive glow & correct serum. We believe in the power of dermal-grade botanicals to bring you luminous skin.',
    price: '₹449',
    size: '30 ml (1.0 fl oz)',
    theme: { text: '#1A1A1A', subText: '#2A2A2A', accent: '#C9A84C', shadow: 'rgba(255,255,255,0.5)', alignClass: 'center', textAlign: 'center' as const },
    benefits: ['Correct Tone.', 'Boost Glow.', 'Stay Calm.'],
    image: require('./assets/product1.png'), // Black pump bottle
    bgImage: require('./assets/background2.png')
  },
  {
    id: 3,
    title: 'Overnight\nRestoration',
    subtitle: 'Ultra Sensitive Repair',
    name: 'NIGHT CREAM',
    description: 'Dermal-Grade Botanical Formula. Gentle, Overnight Restoration. Your skin, renewed.',
    price: '₹399',
    size: '30g (1.0 oz)',
    theme: { text: '#6c0e0eff', subText: '#000000ff', accent: '#972020ff', shadow: 'rgba(87, 27, 51, 0.7)', alignClass: 'flex-end', textAlign: 'right' as const },
    benefits: ['Repair Overnight.', 'Restore Calm.', 'Wake Up Renewed.'],
    image: require('./assets/product3.png'), // Pink jar
    bgImage: require('./assets/bg_restoration_cream.png')
  }
];

const BackgroundImageLayer = ({ product, index, scrollX, vertical }: any) => {
  const scrollDim = vertical ? height : width;
  const bgOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * scrollDim, index * scrollDim, (index + 1) * scrollDim],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <Animated.Image
      source={product.bgImage}
      style={[StyleSheet.absoluteFillObject, bgOpacityStyle, { width: '100%', height: '100%' }]}
      resizeMode="stretch"
    />
  );
};

const FloatingPetals = ({ scrollX, index, source, vertical }: any) => {
  const isMobile = useIsMobile();
  const scrollDim = vertical ? height : width;
  const yOffset1 = useSharedValue(0);
  const yOffset2 = useSharedValue(0);

  React.useEffect(() => {
    yOffset1.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    yOffset2.value = withDelay(1500, withRepeat(
      withSequence(
        withTiming(-30, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
  }, []);

  const petalsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 0.5) * scrollDim, index * scrollDim, (index + 0.5) * scrollDim],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateOffset = interpolate(
      scrollX.value,
      [(index - 1) * scrollDim, index * scrollDim, (index + 1) * scrollDim],
      [scrollDim * 0.5, 0, -scrollDim * 0.5],
      Extrapolation.CLAMP
    );
    if (vertical) {
      return { opacity, transform: [{ translateY: translateOffset }] };
    }
    return { opacity, transform: [{ translateX: translateOffset }] };
  });

  const petal1Style = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset1.value }] }));
  const petal2Style = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset2.value }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, petalsStyle]} pointerEvents="none">
      <Animated.Image
        source={source || require('./assets/petals.png')}
        style={[isMobile ? (index === 2 ? mobileStyles.floatingPetalSmallNC : mobileStyles.floatingPetalSmall) : styles.floatingPetalSmall, petal1Style]}
        resizeMode="contain"
      />
      <Animated.Image
        source={source || require('./assets/petals.png')}
        style={[isMobile ? (index === 2 ? mobileStyles.floatingPetalBigNC : mobileStyles.floatingPetalBig) : styles.floatingPetalBig, petal2Style]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const FloatingBubbles = ({ scrollX, index, source, vertical }: any) => {
  const isMobile = useIsMobile();
  const scrollDim = vertical ? height : width;
  const yOffset1 = useSharedValue(0);
  const yOffset2 = useSharedValue(0);

  React.useEffect(() => {
    yOffset1.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    yOffset2.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
  }, []);

  const bubblesStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 0.5) * scrollDim, index * scrollDim, (index + 0.5) * scrollDim],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateOffset = interpolate(
      scrollX.value,
      [(index - 1) * scrollDim, index * scrollDim, (index + 1) * scrollDim],
      [scrollDim * 0.5, 0, -scrollDim * 0.5],
      Extrapolation.CLAMP
    );
    if (vertical) {
      return { opacity, transform: [{ translateY: translateOffset }], zIndex: 30 };
    }
    return { opacity, transform: [{ translateX: translateOffset }], zIndex: 30 };
  });

  const bubble1Style = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset1.value }] }));
  const bubble2Style = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset2.value }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, bubblesStyle]} pointerEvents="none">
      <Animated.Image
        source={source || require('./assets/bubble.png')}
        style={[isMobile ? (index === 2 ? mobileStyles.floatingBubbleLeftNC : mobileStyles.floatingBubbleLeft) : styles.floatingBubbleLeft, bubble1Style]}
        resizeMode="contain"
      />
      <Animated.Image
        source={source || require('./assets/bubble.png')}
        style={[isMobile ? (index === 2 ? mobileStyles.floatingBubbleRightNC : mobileStyles.floatingBubbleRight) : styles.floatingBubbleRight, bubble2Style]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const FloatingGoldenBubbles = ({ scrollX, index, vertical }: any) => {
  const isMobile = useIsMobile();
  const scrollDim = vertical ? height : width;
  const yOffset1 = useSharedValue(0);
  const yOffset2 = useSharedValue(0);

  React.useEffect(() => {
    yOffset1.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    yOffset2.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
  }, []);

  const bubblesStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 0.5) * scrollDim, index * scrollDim, (index + 0.5) * scrollDim],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateOffset = interpolate(
      scrollX.value,
      [(index - 1) * scrollDim, index * scrollDim, (index + 1) * scrollDim],
      [scrollDim * 0.5, 0, -scrollDim * 0.5],
      Extrapolation.CLAMP
    );
    if (vertical) {
      return { opacity, transform: [{ translateY: translateOffset }], zIndex: 30 };
    }
    return { opacity, transform: [{ translateX: translateOffset }], zIndex: 30 };
  });

  const b1 = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset1.value }] }));
  const b2 = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset2.value }] }));
  const b3 = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset1.value }] }));
  const b4 = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset2.value }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, bubblesStyle]} pointerEvents="none">
      <Animated.Image source={require('./assets/bubble_gold.png')} style={[isMobile ? mobileStyles.floatingBubbleG1 : styles.floatingBubbleG1, b1]} resizeMode="contain" />
      <Animated.Image source={require('./assets/bubble_gold.png')} style={[isMobile ? mobileStyles.floatingBubbleG2 : styles.floatingBubbleG2, b2]} resizeMode="contain" />



      <Animated.Image source={require('./assets/bubble_gold.png')} style={[isMobile ? mobileStyles.floatingBubbleG3 : styles.floatingBubbleG3, b3]} resizeMode="contain" />
      <Animated.Image source={require('./assets/bubble_gold.png')} style={[isMobile ? mobileStyles.floatingBubbleG4 : styles.floatingBubbleG4, b4]} resizeMode="contain" />
    </Animated.View>
  );
};

const MobilePageContent = ({ product, index, scrollX, vertical, onPurchase }: any) => {
  const scrollDim = vertical ? height : width;
  const pageStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 0.6) * scrollDim, index * scrollDim, (index + 0.6) * scrollDim],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translate = interpolate(
      scrollX.value,
      [(index - 1) * scrollDim, index * scrollDim, (index + 1) * scrollDim],
      [60, 0, -60],
      Extrapolation.CLAMP
    );
    if (vertical) {
      return { opacity, transform: [{ translateY: translate }] };
    }
    return { opacity, transform: [{ translateX: translate }] };
  });

  return (
    <View style={[mobileStyles.pageContainer, vertical ? { height, width: '100%' } : { width }]}>
      <Animated.View style={[mobileStyles.contentWrapper, pageStyle]}>
        {/* Top Text Section */}
        <View style={mobileStyles.topTextSection}>
          <Text style={[mobileStyles.title, { color: product.theme.accent, textShadowColor: product.theme.shadow }]}>{product.title}</Text>
          <View style={[mobileStyles.separator, { backgroundColor: product.theme.accent }]} />
          <Text style={[mobileStyles.subtitle, { color: product.theme.subText }]}>{product.subtitle}</Text>
          <Text style={[mobileStyles.productName, { color: product.theme.text }]}>{product.name}</Text>
          <Text style={[mobileStyles.size, { color: product.theme.subText }]}>{product.size}</Text>
        </View>

        {/* Spacer for product image area */}
        <View style={mobileStyles.imageSpace} />

        {/* Bottom Section - Price and Buy Button */}
        <View style={mobileStyles.bottomSection}>
          <Text style={[mobileStyles.price, { color: product.theme.accent }]}>{product.price}</Text>
          <TouchableOpacity style={[mobileStyles.buyBtn, { shadowColor: product.theme.accent }]} onPress={onPurchase}>
            <Text style={mobileStyles.buyBtnText}>Purchase Now</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const PageContent = ({ product, index, scrollX, onPurchase }: any) => {
  const pageStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 0.6) * width, index * width, (index + 0.6) * width],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    const translateX = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [80, 0, -80],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.pageContainer, { width }]}>

      <Animated.View style={[styles.contentGrid, pageStyle]}>
        {/* Left Content (Text) */}
        <View style={[styles.leftCol, { alignItems: product.theme.alignClass as any }]}>
          <Text style={[styles.title, { color: product.theme.accent, textAlign: product.theme.textAlign, textShadowColor: product.theme.shadow }]}>{product.title}</Text>
          <View style={[styles.separator, { backgroundColor: product.theme.accent }]} />
          <Text style={[styles.subtitle, { color: product.theme.subText, textAlign: product.theme.textAlign }]}>{product.subtitle}</Text>
          <Text style={[styles.productName, { color: product.theme.text, textAlign: product.theme.textAlign }]}>{product.name}</Text>
          <Text style={[styles.size, { color: product.theme.subText, textAlign: product.theme.textAlign }]}>{product.size}</Text>
          <Text style={[styles.description, { color: product.theme.subText, textAlign: product.theme.textAlign }]}>{product.description}</Text>
        </View>

        {/* Center Space for Image to avoid overlap */}
        <View style={styles.centerSpace} />

        {/* Right Content (E-Commerce Actions) - Aligned to corner per request */}
        <View style={styles.rightCol}>
          <View style={styles.rightContentWrapper}>
            <View style={styles.benefitsContainer}>
              {product.benefits.map((benefit: string, i: number) => (
                <View key={i} style={styles.benefitRow}>
                  <Sparkles color={product.theme.accent} size={14} style={{ marginRight: 8 }} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.priceActionGroup}>
              <Text style={[styles.price, { color: product.theme.accent }]}>{product.price}</Text>

              <TouchableOpacity style={styles.buyBtn} onPress={onPurchase}>
                <Text style={styles.buyBtnText}>Purchase Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const MobileProductItem = ({ product, index, scrollX, vertical }: any) => {
  const scrollDim = vertical ? height : width;
  const productWidthVals = [width * 1.3, width * 1.3, width * 1.3];
  const productHeightVals = [height * 0.80, height * 0.46, height * 0.82];
  const productTopVals = [height * -0.001, height * 0.18, height * 0.0001];
  const productLeftVals = [0, 0, 0];

  const shadowWidthVals = [250, 200, 250];
  const shadowTopVals = [height * 0.63, height * 0.64, height * 0.65];
  const shadowLeftVals = [-10, 10, -10];

  const prodAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 0.7) * scrollDim, index * scrollDim, (index + 0.7) * scrollDim],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateMain = interpolate(
      scrollX.value,
      [(index - 1) * scrollDim, index * scrollDim, (index + 1) * scrollDim],
      [scrollDim * 0.7, 0, -scrollDim * 0.7],
      Extrapolation.CLAMP
    );
    const rotate = interpolate(
      scrollX.value,
      [(index - 1) * scrollDim, index * scrollDim, (index + 1) * scrollDim],
      [12, 0, -12],
      Extrapolation.CLAMP
    );
    const baseScales = [0.85, 1.1, 0.85];
    const currentBaseScale = baseScales[index];
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * scrollDim, (index - 0.5) * scrollDim, index * scrollDim, (index + 0.5) * scrollDim, (index + 1) * scrollDim],
      [currentBaseScale * 0.3, currentBaseScale * 0.6, currentBaseScale, currentBaseScale * 0.6, currentBaseScale * 0.3],
      Extrapolation.CLAMP
    );

    const baseTranslateY = [height * 0.15, height * 0.15, height * 0.18][index];
    const baseTranslateX = [0, -10, 15][index];

    if (vertical) {
      return {
        opacity,
        transform: [
          { translateY: translateMain + baseTranslateY },
          { translateX: productLeftVals[index] },
          { scale },
          { rotate: `${rotate}deg` },
        ]
      };
    }
    return {
      opacity,
      transform: [
        { translateX: translateMain + baseTranslateX },
        { translateY: baseTranslateY },
        { scale },
        { rotate: `${rotate}deg` },
      ]
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 0.5) * scrollDim, index * scrollDim, (index + 0.5) * scrollDim],
      [0, 0.7, 0],
      Extrapolation.CLAMP
    );

    const translateMain = interpolate(
      scrollX.value,
      [(index - 1) * scrollDim, index * scrollDim, (index + 1) * scrollDim],
      [scrollDim * 0.7, 0, -scrollDim * 0.7],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollX.value,
      [(index - 1) * scrollDim, (index - 0.5) * scrollDim, index * scrollDim, (index + 0.5) * scrollDim, (index + 1) * scrollDim],
      [0.3, 0.5, 0.85, 0.5, 0.3],
      Extrapolation.CLAMP
    );

    const translateYPositions = [0, 0, -height * 0.01];
    const baseTranslateX = [0, -2, 10][index];

    const shadowScaleX = index === 2 ? scale * 1.1 : scale * 0.8;
    const shadowScaleY = scale * 0.15;

    if (vertical) {
      return {
        opacity,
        transform: [
          { translateY: translateMain + translateYPositions[index] },
          { translateX: shadowLeftVals[index] },
          { scaleX: shadowScaleX },
          { scaleY: shadowScaleY }
        ]
      };
    }
    return {
      opacity,
      transform: [
        { translateX: translateMain + baseTranslateX },
        { translateY: translateYPositions[index] },
        { scaleX: shadowScaleX },
        { scaleY: shadowScaleY }
      ]
    };
  });

  return (
    <React.Fragment key={`mobile-prod-${product.id}`}>
      <Animated.View
        style={[
          mobileStyles.productShadow,
          shadowStyle,
          {
            width: shadowWidthVals[index],
            top: shadowTopVals[index],
          }
        ]}
      />
      <Animated.Image
        source={product.image}
        style={[
          { position: 'absolute' },
          prodAnimatedStyle,
          {
            width: productWidthVals[index],
            height: productHeightVals[index],
            top: productTopVals[index],
          }
        ]}
        resizeMode="contain"
      />
    </React.Fragment>
  );
};

const ProductItem = ({ product, index, scrollX }: any) => {
  // Image Animation
  const prodAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 0.7) * width, index * width, (index + 0.7) * width],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    const translateX = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [width * 0.85, 0, -width * 0.85],
      Extrapolation.CLAMP
    );

    const rotate = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [15, 0, -15],
      Extrapolation.CLAMP
    );

    // Base scales for the 3 distinct items. Item 2 (Hair Serum) is enlarged significantly as requested.
    const baseScales = [1, 1.35, 1];
    const currentBaseScale = baseScales[index];

    const scale = interpolate(
      scrollX.value,
      [(index - 1) * width, (index - 0.5) * width, index * width, (index + 0.5) * width, (index + 1) * width],
      [currentBaseScale * 0.4, currentBaseScale * 0.7, currentBaseScale, currentBaseScale * 0.7, currentBaseScale * 0.4],
      Extrapolation.CLAMP
    );

    // Fine-tuned Y-axis offsets per product to place them flush on top of the podium
    // Moved UP to sit precisely on the marble line without cutting into the text.
    const baseTranslateY = [height * -0.02, height * -0.01, height * 0.025][index];//product 1,2,3

    // Nudging the first product slightly to the left relative to the center
    const baseTranslateX = [-5, -20, -6][index];

    return {
      opacity,
      transform: [
        { translateX: translateX + baseTranslateX },
        { translateY: baseTranslateY },
        { scale },
        { rotate: `${rotate}deg` },
      ]
    };
  });

  // Accurate Realistic Shadow beneath the bottle
  const shadowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 0.5) * width, index * width, (index + 0.5) * width],
      [0, 0.7, 0],
      Extrapolation.CLAMP
    );

    const translateX = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [width * 0.85, 0, -width * 0.85],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollX.value,
      [(index - 1) * width, (index - 0.5) * width, index * width, (index + 0.5) * width, (index + 1) * width],
      [0.3, 0.6, 1, 0.6, 0.3],
      Extrapolation.CLAMP
    );

    // Accurate, extremely tight contact shadow perfectly mapped onto the podium surface
    const translateYPositions = [height * 0.224, height * 0.225, height * 0.22];
    const baseTranslateX = [-20, -2, -10][index];

    // Show the contact shadow for all pages
    // Night cream jar (index 2) is wider, so we scale X a bit more
    const shadowScaleX = index === 2 ? scale * 1.1 : scale * 0.8;
    const shadowScaleY = scale * 0.15;

    return {
      opacity,
      transform: [
        { translateX: translateX + baseTranslateX },
        { translateY: translateYPositions[index] },
        { scaleX: shadowScaleX },
        { scaleY: shadowScaleY } // Flat tight contact shadow
      ]
    };
  });

  return (
    <React.Fragment key={product.id}>
      {/* Elliptical Shadow */}
      <Animated.View style={[styles.productShadow, shadowStyle]} />

      <Animated.Image
        source={product.image}
        style={[styles.productImage, prodAnimatedStyle]}
        resizeMode="contain"
      />
    </React.Fragment>
  );
};



export default function App() {
  const scrollRef = React.useRef<any>(null);
  const mainScrollRef = React.useRef<any>(null);
  const scrollX = useSharedValue(0);
  const collectionScrollY = useSharedValue(0);
  const ourStoryScrollY = useSharedValue(0);
  const contactScrollY = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState<'product' | 'collection' | 'our-story' | 'contact' | 'login' | 'checkout' | 'profile'>('product');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  React.useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        if (Platform.OS === 'web') window.localStorage.setItem('daluxe_user_email', session.user.email);
        setUserEmail(session.user.email);
        setAwaitingOtp(false);
        setCurrentPage('profile');
      } else {
        if (Platform.OS === 'web') window.localStorage.removeItem('daluxe_user_email');
        setUserEmail(null);
      }
    });

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else if (Platform.OS === 'web') {
        const saved = window.localStorage.getItem('daluxe_user_email');
        if (saved) setUserEmail(saved);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionView, setCollectionView] = useState<'grid' | 'detail'>('grid');
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);

  const addToCart = React.useCallback((product: ProductType) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    // Delay cart drawer to allow fly-to-cart animation to complete
    setTimeout(() => setCartVisible(true), 850);
  }, []);

  const updateQuantity = React.useCallback((id: string, qty: number) => {
    setCartItems((prev) => prev.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i)));
  }, []);

  const removeFromCart = React.useCallback((id: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== id));
  }, []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleIndexChange = (newIndex: number) => {
    setCurrentIndex((prev) => prev !== newIndex ? newIndex : prev);
  };

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/collection' || path === '/collections') {
        setCurrentPage('collection');
      } else if (path === '/our-story') {
        setCurrentPage('our-story');
      } else if (path === '/contact') {
        setCurrentPage('contact');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/home' || path === '/') {
        setCurrentPage('product');
      }

      window.onpopstate = () => {
        const currentPath = window.location.pathname.toLowerCase();
        if (currentPath === '/collection' || currentPath === '/collections') {
          setCurrentPage('collection');
        } else if (currentPath === '/our-story') {
          setCurrentPage('our-story');
        } else if (currentPath === '/contact') {
          setCurrentPage('contact');
        } else if (currentPath === '/login') {
          setCurrentPage('login');
        } else {
          setCurrentPage('product');
        }
      };
    }
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const path = window.location.pathname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      if (path === '/collection' || path === '/collections' || path === '/products') {
        const concern = searchParams.get('concern');
        if (concern) setSelectedConcern(concern);
        setCurrentPage('collection');
      } else if (path === '/our-story') {
        setCurrentPage('our-story');
      } else if (path === '/contact') {
        setCurrentPage('contact');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/skin-assessment') {
        setCurrentPage('skin-assessment');
      } else if (path === '/home' || path === '/') {
        setCurrentPage('product');
      }

      window.onpopstate = () => {
        const currentPath = window.location.pathname.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        if (currentPath === '/collection' || currentPath === '/collections' || currentPath === '/products') {
          const concern = params.get('concern');
          setSelectedConcern(concern || null);
          setCurrentPage('collection');
        } else if (currentPath === '/our-story') {
          setCurrentPage('our-story');
        } else if (currentPath === '/contact') {
          setCurrentPage('contact');
        } else if (currentPath === '/login') {
          setCurrentPage('login');
        } else if (currentPath === '/skin-assessment') {
          setCurrentPage('skin-assessment');
        } else {
          setCurrentPage('product');
        }
      };
    }
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const pathMap: Record<string, string> = { product: '/home', collection: '/collections', 'our-story': '/our-story', contact: '/contact', login: '/login', 'skin-assessment': '/skin-assessment', profile: '/profile' };
      const path = pathMap[currentPage] || '/home';
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
    }
  }, [currentPage]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (isMobileStatic) {
        scrollX.value = event.contentOffset.y;
        runOnJS(handleIndexChange)(Math.round(event.contentOffset.y / height));
      } else {
        scrollX.value = event.contentOffset.x;
        runOnJS(handleIndexChange)(Math.round(event.contentOffset.x / width));
      }
    },
  });

  // Dynamic base floor shadow adapting to themes
  const podiumShadowStyle = useAnimatedStyle(() => {
    const scrollDim = isMobileStatic ? height : width;
    const backgroundColor = interpolateColor(
      scrollX.value,
      [0, scrollDim, scrollDim * 2],
      ['rgba(0, 150, 255, 0.6)', 'rgba(255, 170, 0, 0.6)', 'rgba(255, 120, 150, 0.6)']
    );
    const opacity = interpolate(scrollX.value, [scrollDim * 1.5, scrollDim * 2, scrollDim * 2.5], [1, 1, 0], Extrapolation.CLAMP);
    return { backgroundColor, opacity };
  });

  // --- Mobile Customizable Podium ---
  const podiumTopVals = [height * 0.62, height * 0.62, height * 0.62];
  const podiumWidthVals = [width * 1.30, width * 1.30, width * 1.30];
  // Positive moves Right, Negative moves Left
  const podiumLeftVals = [0, 20, 0];

  const mobilePodiumStyle = useAnimatedStyle(() => {
    if (!isMobileStatic) return {};
    const opacity = interpolate(scrollX.value, [height * 1.5, height * 2, height * 2.5], [1, 1, 0], Extrapolation.CLAMP);
    return {
      opacity,
      top: interpolate(scrollX.value, [0, height, height * 2], podiumTopVals, Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(scrollX.value, [0, height, height * 2], podiumLeftVals, Extrapolation.CLAMP) }
      ]
    };
  });

  const podiumDesktopStyle = useAnimatedStyle(() => {
    if (isMobileStatic) return {};
    const opacity = interpolate(scrollX.value, [width * 1.5, width * 2, width * 2.5], [1, 1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  const mobilePodiumImageStyle = useAnimatedStyle(() => {
    if (!isMobileStatic) return {};
    const w = interpolate(scrollX.value, [0, height, height * 2], podiumWidthVals, Extrapolation.CLAMP);
    return {
      width: w,
      height: w * (468 / 1380),
      transform: [{ scaleY: 0.85 }],
    };
  });

  const isCollection = currentPage === 'collection';
  const hideNavbarLinks = isCollection && collectionView === 'detail';
  const isMobile = isMobileStatic;

  // Fluid transition logic for the Top Navbar depending on the current page
  const navbarAnimatedStyle = useAnimatedStyle(() => {
    // 1. DETAIL VIEW: Keeps its own positioning (hidden or overlaid)
    if (isCollection && hideNavbarLinks) return { opacity: 1, transform: [{ translateY: 0 }], backgroundColor: 'transparent' };

    // 2. COLLECTION GRID: Fades out completely when scrolled
    if (isCollection) {
      return {
        opacity: interpolate(collectionScrollY.value, [0, 150], [1, 0], Extrapolation.CLAMP),
        transform: [{ translateY: interpolate(collectionScrollY.value, [0, 150], [0, -20], Extrapolation.CLAMP) }],
        backgroundColor: 'transparent',
        borderBottomColor: 'transparent',
        paddingTop: Platform.OS === 'web' ? 30 : 50,
        paddingBottom: 20,
      };
    }

    // 3. STORY / CONTACT / HOME: Liquid glass effect that shrinks height smoothly
    const currentScrollY = currentPage === 'our-story' ? ourStoryScrollY.value : currentPage === 'contact' ? contactScrollY.value : 0;

    if (currentPage === 'our-story' || currentPage === 'contact') {
      const bgOpacity = interpolate(currentScrollY, [0, 150], [0, 0.75], Extrapolation.CLAMP);
      const blurLevel = interpolate(currentScrollY, [0, 150], [0, 24], Extrapolation.CLAMP);
      const borderOpacity = interpolate(currentScrollY, [0, 150], [0, 0.15], Extrapolation.CLAMP);

      const ptDesktop = interpolate(currentScrollY, [0, 150], [30, 16], Extrapolation.CLAMP);
      const ptMobile = interpolate(currentScrollY, [0, 150], [50, 40], Extrapolation.CLAMP);
      const pb = interpolate(currentScrollY, [0, 150], [20, 12], Extrapolation.CLAMP);

      return {
        paddingTop: Platform.OS === 'web' ? ptDesktop : ptMobile,
        paddingBottom: pb,
        backgroundColor: `rgba(253, 251, 247, ${bgOpacity})`,
        borderBottomWidth: 1,
        borderBottomColor: `rgba(233, 195, 73, ${borderOpacity})`,
        ...(Platform.OS === 'web' ? { backdropFilter: `blur(${blurLevel}px)` } : {})
      } as any;
    }

    // Default home page
    return {
      backgroundColor: 'transparent',
      borderBottomWidth: 0,
      paddingTop: Platform.OS === 'web' ? 30 : 50,
      paddingBottom: 20,
    };
  });

  const bottomNavAnimatedStyle = useAnimatedStyle(() => {
    if (currentPage !== 'product') {
       return { opacity: 1, transform: [{ translateY: 0 }] };
    }
    const opacity = interpolate(
      scrollX.value,
      [height * 2.1, height * 2.8],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollX.value,
      [height * 2.1, height * 2.8],
      [60, 0],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View style={[styles.container, (isCollection || currentPage === 'our-story' || currentPage === 'contact') && { backgroundColor: '#FDFBF7' }]}>

      {/* Navbar (Fixed - always visible) */}
      <Animated.View pointerEvents="box-none" style={[styles.navbar, isMobile && mobileStyles.navbar, navbarAnimatedStyle as any]}>
        {!hideNavbarLinks ? (
          <TouchableOpacity onPress={() => setCurrentPage('product')}>
            <Image
              source={require('./assets/logo.png')}
              style={isMobile ? mobileStyles.logo : styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : <View style={isMobile ? mobileStyles.logo : styles.logo} />}
        {/* Desktop nav links */}
        {!isMobile && !hideNavbarLinks && (
          <View style={[styles.navLinks]}>
            <TouchableOpacity onPress={() => setCurrentPage('product')}>
              <Text style={currentPage === 'product' ? [styles.navLinkActive, { backgroundColor: '#e9c349', color: '#000' }] : styles.navLink}>Product</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentPage('collection')}>
              <Text style={currentPage === 'collection' ? [styles.navLinkActive, { backgroundColor: '#e9c349', color: '#000' }] : styles.navLink}>Collection</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentPage('our-story')}>
              <Text style={currentPage === 'our-story' ? [styles.navLinkActive, { backgroundColor: '#e9c349', color: '#000' }] : styles.navLink}>Our Story</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentPage('contact')}>
              <Text style={currentPage === 'contact' ? [styles.navLinkActive, { backgroundColor: '#e9c349', color: '#000' }] : styles.navLink}>Contact</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Mobile + Desktop right icons */}
        <View style={isMobile ? mobileStyles.navIcons : styles.navIcons}>
          {!isMobile && (
            <TouchableOpacity style={styles.iconBtn} onPress={() => setCurrentPage(userEmail ? 'profile' : 'login')}>
              <User color="#e9c349" size={20} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn} onPress={() => setCartVisible(true)}>
            <ShoppingCart color="#e9c349" size={20} />
            {cartCount > 0 && (
              <View style={{
                position: 'absolute', top: -4, right: -4, backgroundColor: '#D32F2F', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5
              }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Mobile Menu Overlay */}
      {isMobile && menuOpen && (
        <View style={mobileStyles.menuOverlay}>
          <View style={mobileStyles.menuContent}>
            {(['product', 'collection', 'our-story', 'contact', 'login'] as const).map((page) => {
              const label = page === 'product' ? 'PRODUCT' : page === 'collection' ? 'COLLECTION' : page === 'our-story' ? 'OUR STORY' : page === 'contact' ? 'CONTACT' : 'LOGIN';
              return (
                <TouchableOpacity
                  key={page}
                  onPress={() => {
                    setCurrentPage(page);
                    setMenuOpen(false);
                  }}
                  style={mobileStyles.menuItem}
                >
                  <Text style={mobileStyles.menuItemText}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ===== PRODUCT PAGE ===== */}
      {currentPage === 'product' && (
        <React.Fragment>
          {(() => {
            const heroContent = (
              <React.Fragment>
                {/* BACKGROUND IMAGES */}
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                  {PRODUCTS.map((product, index) => (
                    <BackgroundImageLayer key={`bg-${product.id}`} product={product} index={index} scrollX={scrollX} vertical={isMobile} />
                  ))}
                </View>

                {/* FLOATING PETALS AND BUBBLES FOR FACE SERUM & NIGHT CREAM */}
                <FloatingPetals scrollX={scrollX} index={0} source={require('./assets/blue_petals.png')} vertical={isMobile} />
                <FloatingBubbles scrollX={scrollX} index={0} source={require('./assets/blue_bubblu_kutti.png')} vertical={isMobile} />
                <FloatingGoldenBubbles scrollX={scrollX} index={1} vertical={isMobile} />
                <FloatingPetals scrollX={scrollX} index={2} vertical={isMobile} />
                <FloatingBubbles scrollX={scrollX} index={2} vertical={isMobile} />

                {/* Main Scrollable Area - Vertical on mobile, Horizontal on desktop */}
                <Animated.ScrollView
                  ref={scrollRef}
                  horizontal={!isMobile}
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  onScroll={scrollHandler}
                  scrollEventThrottle={16}
                  style={StyleSheet.absoluteFill}
                  snapToInterval={isMobile ? height : undefined}
                  decelerationRate={isMobile ? 'fast' : undefined}
                >
                  {PRODUCTS.map((product, index) =>
                    isMobile
                      ? <MobilePageContent key={product.id} product={product} index={index} scrollX={scrollX} vertical onPurchase={() => setCurrentPage('collection')} />
                      : <PageContent key={product.id} product={product} index={index} scrollX={scrollX} onPurchase={() => setCurrentPage('collection')} />
                  )}
                  {isMobile && (
                    <View style={{ width, height }}>
                       <ScrollView nestedScrollEnabled style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces={false}>
                          <HomeSections onAddToCart={addToCart} onProductClick={(p: any) => {
                             setSelectedProductId(p.id);
                             setCurrentPage('collection');
                          }} onStartScan={() => setCurrentPage('skin-assessment')}
                          onConcernClick={(concernId: string) => {
                             setSelectedConcern(concernId);
                             setCurrentPage('collection');
                          }} />
                       </ScrollView>
                    </View>
                  )}
                </Animated.ScrollView>

                {/* Shared Absolute Product Image Container */}
                <View style={isMobile ? mobileStyles.centerProductWrapper : styles.centerProductWrapper} pointerEvents="none">
                  {isMobile ? (
                    <>
                      {/* Mobile: Podium + Products */}
                      <Animated.View style={[mobileStyles.podiumContainer, mobilePodiumStyle]}>
                        <Animated.View style={[mobileStyles.podiumFloorShadow, podiumShadowStyle]} />
                        <Animated.Image
                          source={require('./assets/podium_custom.png')}
                          style={mobilePodiumImageStyle}
                          resizeMode="contain"
                        />
                      </Animated.View>
                      {PRODUCTS.map((product, index) => (
                        <MobileProductItem key={product.id} product={product} index={index} scrollX={scrollX} vertical />
                      ))}
                    </>
                  ) : (
                    <>
                      {/* Desktop: Original Podium + Products */}
                      <Animated.View style={[styles.podiumContainer, podiumDesktopStyle]}>
                        <Animated.View style={[styles.podiumFloorShadow, podiumShadowStyle]} />
                        <Image
                          source={require('./assets/podium_custom.png')}
                          style={styles.podiumImage}
                          resizeMode="contain"
                        />
                      </Animated.View>
                      {PRODUCTS.map((product, index) => (
                        <ProductItem key={product.id} product={product} index={index} scrollX={scrollX} />
                      ))}
                    </>
                  )}
                </View>

                {/* Global Foreground Glass Elements (Arrows) - Desktop only */}
                {!isMobile && (
                  <View style={styles.overlayControls} pointerEvents="box-none">
                    {currentIndex > 0 ? (
                      <View style={styles.navArrowWrapper}>
                        <TouchableOpacity
                          style={[styles.navArrow, { borderColor: 'rgba(255,255,255,0.4)' }]}
                          onPress={() => {
                            const target = Math.max(0, Math.round(scrollX.value / width) - 1);
                            scrollRef.current?.scrollTo({ x: target * width, y: 0, animated: true });
                          }}>
                          <ChevronLeft color="#fff" size={32} />
                        </TouchableOpacity>
                      </View>
                    ) : <View style={styles.navArrowHidden} />}

                    {currentIndex < PRODUCTS.length - 1 ? (
                      <View style={styles.navArrowWrapper}>
                        <TouchableOpacity
                          style={[styles.navArrow, { borderColor: 'rgba(255,255,255,0.4)' }]}
                          onPress={() => {
                            const target = Math.min(PRODUCTS.length - 1, Math.round(scrollX.value / width) + 1);
                            scrollRef.current?.scrollTo({ x: target * width, y: 0, animated: true });
                          }}>
                          <ChevronRight color="#fff" size={32} />
                        </TouchableOpacity>
                      </View>
                    ) : <View style={styles.navArrowHidden} />}
                  </View>
                )}

                {/* Bottom Legal / Trust Footer */}
                {!isMobile && (
                  <View style={styles.footer} pointerEvents="none">
                    <Sparkles color="#ffffff" size={16} style={{ marginRight: 8, opacity: 0.5 }} />
                    <Text style={styles.footerText}>
                      Dermal-Grade Botanical Formula, ISO & GMP Certified. Made in India.
                    </Text>
                  </View>
                )}
              </React.Fragment>
            );

            return isMobile ? (
               <View style={{ flex: 1 }}>{heroContent}</View>
            ) : (
               <ScrollView ref={mainScrollRef} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} bounces={false}>
                 <View style={{ height, width, overflow: 'hidden' }}>{heroContent}</View>
                  <HomeSections onAddToCart={addToCart} onProductClick={(p: any) => {
                      setSelectedProductId(p.id);
                      setCurrentPage('collection');
                  }} onStartScan={() => setCurrentPage('skin-assessment')}
                  onConcernClick={(concernId: string) => {
                     setSelectedConcern(concernId);
                     setCurrentPage('collection');
                  }} />
               </ScrollView>
            );
          })()}
        </React.Fragment>
      )}

      {/* ===== COLLECTION PAGE ===== */}
      {currentPage === 'collection' && (
        <CollectionPage
          scrollY={collectionScrollY}
          onViewChange={setCollectionView}
          addToCart={addToCart}
          initialProductId={selectedProductId}
          onNavigateToProduct={(index: number) => {
            setCurrentPage('product');
            setTimeout(() => {
              scrollRef.current?.scrollTo({ x: index * width, y: 0, animated: false });
              setCurrentIndex(index);
            }, 100);
          }}
          initialConcern={selectedConcern}
          onClearConcern={() => setSelectedConcern(null)}
        />
      )}

      {/* ===== OUR STORY PAGE ===== */}
      {currentPage === 'our-story' && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
          <OurStoryPage externalScrollY={ourStoryScrollY} />
        </View>
      )}

      {/* ===== AI SKIN ASSESSMENT ===== */}
      {currentPage === 'skin-assessment' && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }}>
          <SkinAssessmentPage />
        </View>
      )}

      {/* ===== CONTACT PAGE ===== */}
      {currentPage === 'contact' && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
          <ContactPage externalScrollY={contactScrollY} />
        </View>
      )}

      {/* ===== CHECKOUT PAGE ===== */}
      {currentPage === 'checkout' && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
          <CheckoutPage
            items={cartItems.map(i => ({
              id: i.product.id,
              name: i.product.shortName,
              price: i.product.price,
              quantity: i.quantity,
              image: i.product.image,
              priceDisplay: i.product.priceDisplay,
              sizeDetail: i.product.sizeDetail,
            }))}
            onBack={() => { setCurrentPage('product'); setCartVisible(false); }}
            onSuccess={() => {
              setCartItems([]);
              setTimeout(() => setCurrentPage('product'), 2500);
            }}
            razorpayKeyId={(typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_RAZORPAY_KEY_ID) || ''}
          />
        </View>
      )}

      {/* ===== LOGIN PAGE ===== */}
      {currentPage === 'login' && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }}>
          <LoginPage 
            awaitingOtp={awaitingOtp}
            onSkip={() => setCurrentPage('product')} 
            onLogin={async (email) => {
              const { error } = await supabaseClient.auth.signInWithOtp({ email });
              if (error) {
                alert(error.message);
              } else {
                setAwaitingOtp(true);
                alert('Verification code sent to your email.');
              }
            }} 
            onVerify={async (email, token) => {
              const { data, error } = await supabaseClient.auth.verifyOtp({ email, token, type: 'email' });
              if (error) {
                alert('Invalid code. Please try again.');
              } else if (data.session) {
                // onAuthStateChange handles redirect
              }
            }}
          />
        </View>
      )}

      {/* ===== PROFILE PAGE ===== */}
      {currentPage === 'profile' && userEmail && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }}>
          <ProfilePage 
            userEmail={userEmail} 
            onBack={() => setCurrentPage('product')}
            onLogout={async () => {
              if (Platform.OS === 'web') window.localStorage.removeItem('daluxe_user_email');
              await supabaseClient.auth.signOut();
              setUserEmail(null);
              setCurrentPage('login');
            }}
          />
        </View>
      )}

      {/* ===== MOBILE BOTTOM NAVBAR — hidden on checkout / skin-assessment / login / profile ===== */}
      {isMobile && !['checkout', 'skin-assessment', 'login', 'profile'].includes(currentPage) && (
        <Animated.View style={[{
          position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 800,
          borderRadius: 40,
          shadowColor: '#C9A227', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 15,
          overflow: 'hidden'
        }, bottomNavAnimatedStyle]}>
          <LinearGradient
            colors={['rgba(24, 20, 16, 0.45)', 'rgba(5, 5, 5, 0.55)']}
            start={{x: 0,y: 0}} end={{x: 1,y: 1}}
            style={{
              flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
              paddingVertical: 10, paddingHorizontal: 10,
              borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 40,
              ...(Platform.OS === 'web' ? { 
                backdropFilter: 'saturate(200%) blur(40px)', 
                WebkitBackdropFilter: 'saturate(200%) blur(40px)',
                boxShadow: 'inset 0px 1px 1px rgba(255,255,255,0.15)'
              } as any : {})
            }}>
            <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => setCurrentPage('product')}>
              <Home color={currentPage === 'product' ? '#E9C349' : 'rgba(233, 195, 73, 0.6)'} size={22} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => setCurrentPage('collection')}>
              <LayoutGrid color={currentPage === 'collection' ? '#E9C349' : 'rgba(233, 195, 73, 0.6)'} size={22} />
            </TouchableOpacity>
            
            <TouchableOpacity style={{
              position: 'relative', top: -15,
              width: 56, height: 56, borderRadius: 28,
              shadowColor: '#E9C349', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10
            }} onPress={() => setCurrentPage('skin-assessment')}>
              <LinearGradient colors={['#FFF1B9', '#D4AF37', '#8A5A19']} start={{x: 0.2,y: 0}} end={{x: 0.8,y: 1}} style={{ flex: 1, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}>
                 <ScanFace color="#110C07" size={26} strokeWidth={1.5} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => setCurrentPage('contact')}>
              <MessageCircle color={currentPage === 'contact' ? '#E9C349' : 'rgba(233, 195, 73, 0.6)'} size={22} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => setCurrentPage(userEmail ? 'profile' : 'login')}>
              <User color={currentPage === 'login' || currentPage === 'profile' ? '#E9C349' : 'rgba(233, 195, 73, 0.6)'} size={22} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        items={cartItems}
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          setCartVisible(false);
          setCurrentPage('checkout');
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },

  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: Platform.OS === 'web' ? 30 : 50,
    paddingBottom: 20,
  },
  logo: {
    height: 60,
    width: 140,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 30,
    padding: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    ...Platform.select({
      web: { backdropFilter: 'blur(20px)' }
    })
  },
  navLinkActive: {
    color: '#000',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    fontSize: 14,
    fontWeight: '700',
  },
  navLink: {
    color: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  navIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ web: { backdropFilter: 'blur(10px)' } })
  },
  pageContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  contentGrid: {
    width: '100%',
    maxWidth: 1400, // Reduced max-width creates more empty margin on large screens
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 80,
    zIndex: 10,
  },
  leftCol: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: 60,
  },
  title: {
    fontSize: 72, // Scaled down from 82
    fontWeight: '800',
    lineHeight: 78,
    marginBottom: 20,
    letterSpacing: -2,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  separator: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 24,
    borderRadius: 2,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 18, // Scaled down from 22
    fontWeight: '400',
    marginBottom: 10,
    opacity: 0.9,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  productName: {
    color: '#ffffff',
    fontSize: 36, // Scaled down from 42
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: 4,
  },
  size: {
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 24,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  description: {
    color: '#ffffff',
    fontSize: 16, // Scaled down from 18
    lineHeight: 26,
    opacity: 0.85,
    maxWidth: 380, // Narrower text block
    fontWeight: '300',
  },
  centerSpace: {
    flex: 1.2, // Gap in the middle where product sits
  },
  rightCol: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end', // flush to the right edge
  },
  rightContentWrapper: {
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 240, // Reduced max-width from 280
  },
  benefitsContainer: {
    marginBottom: 30,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitText: {
    color: '#ffffff',
    fontSize: 17, // Scaled down from 20
    fontWeight: '400',
    opacity: 0.95,
  },
  sectionLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.5,
    marginBottom: 16,
    letterSpacing: 2,
  },
  sizeSelectorGroup: {
    marginBottom: 40,
  },
  sizeSelector: {
    flexDirection: 'row',
    gap: 16,
  },
  sizeBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    ...Platform.select({ web: { backdropFilter: 'blur(10px)' } })
  },
  sizeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  priceActionGroup: {
    marginTop: 20,
  },
  price: {
    fontSize: 46, // Scaled down from 54
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  buyBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 40, // Scaled down padding
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: {
    color: '#000000',
    fontSize: 14, // Scaled down from 16
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  centerProductWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    transform: [{ translateX: 40 }], // Shifted slightly right to balance the text on the left
  },
  podiumContainer: {
    position: 'absolute',
    top: height * 0.60, // Positioned solidly in the lower half of the viewport
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumImage: {
    width: width * 0.65, // Slight width increase to support the squash
    height: width * 0.65 * (468 / 1380),
    maxWidth: 550,
    maxHeight: 550 * (468 / 1380),
    transform: [{ scaleY: 0.85 }] // Squashes the 3D cylinder to correctly match the bottle camera perspective angle
  },
  podiumFloorShadow: {
    position: 'absolute',
    bottom: -15, // Sit just underneath the podium visually
    width: width * 0.5,
    maxWidth: 420,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#000',
    ...Platform.select({ web: { filter: 'blur(30px)' } }),
    opacity: 0.8, // Slightly stronger for depth blending
  },
  productImage: {
    position: 'absolute',
    height: height * 0.75, // Scaled up slightly
    width: width * 0.4,
    // Note: removed standard shadow on image to make custom shadow `productShadow` look more realistic
  },
  productShadow: {
    position: 'absolute',
    width: 180, // Tighter width for contact point
    height: 40,
    backgroundColor: '#000000',
    borderRadius: 999,
    ...Platform.select({ web: { filter: 'blur(10px)' } }), // Sharper blur for physical contact
  },
  overlayControls: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 50,
  },
  navArrowWrapper: {
    pointerEvents: 'auto',
  },
  navArrow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowHidden: {
    width: 64,
    height: 64,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#1A1A1A',
    fontSize: 12,
    opacity: 0.7,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  floatingPetalSmall: {
    position: 'absolute',
    left: '33%',
    top: '53%',
    width: 180,
    height: 180,
    opacity: 0.85,
  },
  floatingPetalBig: {
    position: 'absolute',
    right: '23%',
    top: '20%',
    width: 290,
    height: 290,
    opacity: 0.95,
    transform: [{ rotate: '15deg' }],
  },
  floatingBubbleLeft: {
    position: 'absolute',
    left: '29%',
    top: '20%',
    width: 300,
    height: 300,
    opacity: 0.9,
  },
  floatingBubbleRight: {
    position: 'absolute',
    right: '29.9%',
    top: '59%',
    width: 190,
    height: 190,
    opacity: 0.95,
    zIndex: 9999,
    ...Platform.select({ web: { filter: 'blur(0.9px)' } }),
  },
  floatingBubbleG1: {
    position: 'absolute',
    left: '55%',
    top: '12%',
    width: 150,
    height: 150,
    opacity: 0.9,
    ...Platform.select({ web: { filter: 'blur(0.9px)' } }),
  },
  floatingBubbleG2: {
    position: 'absolute',
    right: '48%',
    top: '22%',
    width: 240,
    height: 240,
    opacity: 0.95,
    zIndex: 35,
    ...Platform.select({ web: { filter: 'blur(0.5px)' } }),
  },
  floatingBubbleG3: {
    position: 'absolute',
    left: '29%',
    top: '43%',
    width: 310,
    height: 310,
    opacity: 0.85,
  },
  floatingBubbleG4: {
    position: 'absolute',
    right: '31%',
    top: '62%',
    width: 200,
    height: 200,
    opacity: 0.9,
    zIndex: 40,
    ...Platform.select({ web: { filter: 'blur(0.9px)' } }),
  },
  lensFlareContainer: {
    position: 'absolute',
    right: '48%',
    top: '22%',
    width: 240,
    height: 240,
    zIndex: 50,
  },
  flareCenterHub: {
    position: 'absolute',
    top: 98,
    right: 105, // Target the top right curve of the glowing gold bubble
    width: 0,
    height: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  flareCore: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    ...Platform.select({ web: { filter: 'blur(2px)' } }),
  },
  flareRay: {
    position: 'absolute',
    width: 250,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    ...Platform.select({ web: { filter: 'blur(1px)' } }),
  },

});

// ========================
// MOBILE STYLES
// ========================
const mobileStyles = StyleSheet.create({
  navbar: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 50,
    paddingBottom: 12,
  },
  logo: {
    height: 48,
    width: 100,
  },
  navIcons: {
    flexDirection: 'row',
    gap: 10,
  },

  // Mobile menu overlay
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    ...Platform.select({ web: { backdropFilter: 'blur(12px)' } }),
  },
  menuContent: {
    paddingTop: 110,
    paddingLeft: 30,
  },
  menuItem: {
    marginBottom: 12,
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // Mobile page content (vertical layout)
  pageContainer: {
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 84,
  },
  topTextSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    zIndex: 10,
    width: '100%',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 52,
    marginBottom: 8,
    letterSpacing: -1,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  separator: {
    width: 0,
    height: 0,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
    textAlign: 'center',
  },
  productName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: 'center',
  },
  size: {
    fontSize: 13,
    opacity: 0.7,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  imageSpace: {
    width: '100%',
    height: height * 0.35,
  },
  bottomSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: height * 0.05, // Bring it down a bit from the image
    zIndex: 10,
    width: '100%',
    flex: 1, // Use remaining space
  },
  price: {
    fontSize: 72,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -1,
    right: 17,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  buyBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 40,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    width: '85%',
    alignItems: 'center',
    transform: [{ translateY: 0 }],
  },
  buyBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Mobile product image
  centerProductWrapper: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 20,
  },
  productImage: {
    // Moved to per-product arrays in MobileProductItem
  },
  podiumContainer: {
    position: 'absolute',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  podiumImage: {
    // Moved to interpolated arrays
  },
  podiumFloorShadow: {
    position: 'absolute',
    width: width * 0.90,
    height: 40,
    bottom: -10,
    borderRadius: 100,
    ...Platform.select({ web: { filter: 'blur(30px)' } }),
  },
  productShadow: {
    position: 'absolute',
    height: 170,
    borderRadius: 100,
    backgroundColor: '#000000',
    ...Platform.select({ web: { filter: 'blur(10px)' } }),
  },

  // ---- Mobile Floating Elements Isolation ----
  floatingPetalSmall: {
    position: 'absolute',
    left: '6%',
    top: '55%',
    width: 140,
    height: 140,
    opacity: 0.6,
  },
  floatingPetalBig: {
    position: 'absolute',
    right: '14%',
    top: '40%',
    width: 140,
    height: 140,
    opacity: 0.7,
    transform: [{ rotate: '15deg' }],
  },
  floatingBubbleLeft: {
    position: 'absolute',
    left: '8%',
    top: '39%',
    width: 180,
    height: 180,
    opacity: 0.8,
  },
  floatingBubbleRight: {
    position: 'absolute',
    right: '1%',
    top: '60%',
    width: 190,
    height: 190,
    opacity: 0.8,
    ...Platform.select({ web: { filter: 'blur(0.6px)' } }),
    zIndex: 9999,

  },

  // Night Cream (index 2) Isolated Floating Elements
  floatingPetalSmallNC: {
    position: 'absolute',
    left: '-4%',
    top: '55%',
    width: 140,
    height: 140,
    opacity: 0.6,
  },
  floatingPetalBigNC: {
    position: 'absolute',
    right: '10%',
    top: '30%',
    width: 170,
    height: 170,
    opacity: 0.8,
  },
  floatingBubbleLeftNC: {
    position: 'absolute',
    left: '1%',
    top: '30%',
    width: 220,
    height: 220,
    opacity: 0.8,
  },
  floatingBubbleRightNC: {
    position: 'absolute',
    right: '10%',
    top: '60%',
    width: 190,
    height: 190,
    opacity: 0.8,
    ...Platform.select({ web: { filter: 'blur(0.6px)' } }),
    zIndex: 9999,
  },

  floatingBubbleG1: {
    position: 'absolute',
    left: '10%',
    top: '36%',
    width: 160,
    height: 160,
    opacity: 0.8,
    ...Platform.select({ web: { filter: 'blur(0.6px)' } }),
  },
  floatingBubbleG2: {
    position: 'absolute',
    right: '15%',
    top: '35%',
    width: 100,
    height: 100,
    opacity: 0.85,
    ...Platform.select({ web: { filter: 'blur(0.6px)' } }),
    zIndex: 35,
  },
  floatingBubbleG3: {
    position: 'absolute',
    left: '5%',
    top: '55%',
    width: 220,
    height: 220,
    opacity: 0.7,
  },
  floatingBubbleG4: {
    position: 'absolute',
    right: '5%',
    top: '45%',
    width: 210,
    height: 210,
    opacity: 0.8,
    zIndex: 40,
  },

  // Mobile footer
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 9,
    opacity: 0.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

