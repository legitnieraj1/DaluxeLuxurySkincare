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
  Easing
} from 'react-native-reanimated';
import { User, ShoppingCart, ChevronLeft, ChevronRight, Sparkles, Menu, X } from 'lucide-react-native';
import CollectionPage from './CollectionPage';

const { height, width } = Dimensions.get('window');
const isMobile = width < 768;

const PRODUCTS = [
  {
    id: 1,
    title: 'Reveal\nYour Glow',
    subtitle: 'Ultra Sensitive Glow & Correct',
    name: 'FACE SERUM',
    description: 'Discover a world of radiant skin with our ultra-sensitive glow & correct serum. We believe in the power of dermal-grade botanicals to bring you luminous skin.',
    price: '₹4,150',
    size: '30 ml (1.0 fl oz)',
    theme: { text: '#108cbaff', subText: '#0b0b0bff', accent: '#3d3d3dff', shadow: 'rgba(229, 0, 0, 0.6)', alignClass: 'flex-start', textAlign: 'left' as const },
    benefits: ['Correct Tone.', 'Boost Glow.', 'Stay Calm.'],
    image: require('./assets/product2.png'), // Gold bottle
    bgImage: require('./assets/bg_face_serum.png')
  },
  {
    id: 2,
    title: 'Weightless\nPerfection',
    subtitle: 'Ultra Sensitive Smooth',
    name: 'HAIR SERUM',
    description: 'Dermal-Grade Botanical Formula. Weightless Smoothness, Natural Shine. Zero Silicone Feel. Your hair, perfected.',
    price: '₹2,100',
    size: '30 ml (1.0 fl oz)',
    theme: { text: '#211700', subText: '#4A3300', accent: '#0D0800', shadow: 'rgba(255,255,255,0.4)', alignClass: 'center', textAlign: 'center' as const },
    benefits: ['Weightless.', 'Natural Shine.', 'Zero Silicone.'],
    image: require('./assets/product1.png'), // Black pump bottle
    bgImage: require('./assets/bg_hair_serum.png')
  },
  {
    id: 3,
    title: 'Overnight\nRestoration',
    subtitle: 'Ultra Sensitive Repair',
    name: 'NIGHT CREAM',
    description: 'Dermal-Grade Botanical Formula. Gentle, Overnight Restoration. Your skin, renewed.',
    price: '₹2,100',
    size: '30g (1.0 oz)',
    theme: { text: '#6c0e0eff', subText: '#000000ff', accent: '#972020ff', shadow: 'rgba(87, 27, 51, 0.7)', alignClass: 'flex-end', textAlign: 'right' as const },
    benefits: ['Repair Overnight.', 'Restore Calm.', 'Wake Up Renewed.'],
    image: require('./assets/product3.png'), // Pink jar
    bgImage: require('./assets/bg_restoration_cream.png')
  }
];

const BackgroundImageLayer = ({ product, index, scrollX }: any) => {
  const bgOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
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

const FloatingPetals = ({ scrollX, index, source }: any) => {
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
      [(index - 0.5) * width, index * width, (index + 0.5) * width],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateX = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [width * 0.5, 0, -width * 0.5],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateX }] };
  });

  const petal1Style = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset1.value }] }));
  const petal2Style = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset2.value }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, petalsStyle]} pointerEvents="none">
      <Animated.Image
        source={source || require('./assets/petals.png')}
        style={[styles.floatingPetalSmall, petal1Style]}
        resizeMode="contain"
      />
      <Animated.Image
        source={source || require('./assets/petals.png')}
        style={[styles.floatingPetalBig, petal2Style]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const FloatingBubbles = ({ scrollX, index, source }: any) => {
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
      [(index - 0.5) * width, index * width, (index + 0.5) * width],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateX = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [width * 0.5, 0, -width * 0.5],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateX }], zIndex: 30 };
  });

  const bubble1Style = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset1.value }] }));
  const bubble2Style = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset2.value }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, bubblesStyle]} pointerEvents="none">
      <Animated.Image
        source={source || require('./assets/bubble.png')}
        style={[styles.floatingBubbleLeft, bubble1Style]}
        resizeMode="contain"
      />
      <Animated.Image
        source={source || require('./assets/bubble.png')}
        style={[styles.floatingBubbleRight, bubble2Style]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const FloatingGoldenBubbles = ({ scrollX, index }: any) => {
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
      [(index - 0.5) * width, index * width, (index + 0.5) * width],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateX = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [width * 0.5, 0, -width * 0.5],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateX }], zIndex: 30 };
  });

  const b1 = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset1.value }] }));
  const b2 = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset2.value }] }));
  const b3 = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset1.value }] }));
  const b4 = useAnimatedStyle(() => ({ transform: [{ translateY: yOffset2.value }] }));

  // Flare animation
  const flareStyle = useAnimatedStyle(() => {
    // Pulse scale and opacity
    const scale = interpolate(yOffset1.value, [-15, 0], [1.1, 0.9]);
    const flareOpacity = interpolate(yOffset1.value, [-15, 0], [1, 0.7]);
    return {
      transform: [{ scale }],
      opacity: flareOpacity,
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, bubblesStyle]} pointerEvents="none">
      <Animated.Image source={require('./assets/bubble_gold.png')} style={[styles.floatingBubbleG1, b1]} resizeMode="contain" />
      <Animated.Image source={require('./assets/bubble_gold.png')} style={[styles.floatingBubbleG2, b2]} resizeMode="contain" />

      {/* Moving Realistic Lens Flare tied to the top-right of G2 */}
      <Animated.View style={[styles.lensFlareContainer, b2, flareStyle]}>
        <View style={styles.flareCenterHub}>
          {/* Starburst rays */}
          <View style={[styles.flareRay, { transform: [{ rotate: '0deg' }] }]} />
          <View style={[styles.flareRay, { transform: [{ rotate: '90deg' }] }]} />
          <View style={[styles.flareRay, { width: 140, opacity: 0.6, transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.flareRay, { width: 140, opacity: 0.6, transform: [{ rotate: '-45deg' }] }]} />

          {/* Bright Core */}
          <View style={styles.flareCore} />
        </View>
      </Animated.View>

      <Animated.Image source={require('./assets/bubble_gold.png')} style={[styles.floatingBubbleG3, b3]} resizeMode="contain" />
      <Animated.Image source={require('./assets/bubble_gold.png')} style={[styles.floatingBubbleG4, b4]} resizeMode="contain" />
    </Animated.View>
  );
};

const MobilePageContent = ({ product, index, scrollX }: any) => {
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
      [60, 0, -60],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateX }] };
  });

  return (
    <View style={[mobileStyles.pageContainer, { width }]}>
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

        {/* Bottom Section - Benefits, Description, Price, Button */}
        <View style={mobileStyles.bottomSection}>
          <View style={mobileStyles.benefitsContainer}>
            {product.benefits.map((benefit: string, i: number) => (
              <View key={i} style={mobileStyles.benefitRow}>
                <Sparkles color={product.theme.accent} size={12} style={{ marginRight: 8 }} />
                <Text style={[mobileStyles.benefitText, { color: product.theme.subText }]}>{benefit}</Text>
              </View>
            ))}
          </View>
          <Text style={[mobileStyles.description, { color: product.theme.subText }]}>{product.description}</Text>
          <Text style={[mobileStyles.price, { color: product.theme.accent }]}>{product.price}</Text>
          <TouchableOpacity style={mobileStyles.buyBtn}>
            <Text style={mobileStyles.buyBtnText}>Purchase Now</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const PageContent = ({ product, index, scrollX }: any) => {
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

              <TouchableOpacity style={styles.buyBtn}>
                <Text style={styles.buyBtnText}>Purchase Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const MobileProductItem = ({ product, index, scrollX }: any) => {
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
      [width * 0.7, 0, -width * 0.7],
      Extrapolation.CLAMP
    );
    const rotate = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [12, 0, -12],
      Extrapolation.CLAMP
    );
    const baseScales = [0.85, 1.1, 0.85];
    const currentBaseScale = baseScales[index];
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * width, (index - 0.5) * width, index * width, (index + 0.5) * width, (index + 1) * width],
      [currentBaseScale * 0.3, currentBaseScale * 0.6, currentBaseScale, currentBaseScale * 0.6, currentBaseScale * 0.3],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [
        { translateX },
        { scale },
        { rotate: `${rotate}deg` },
      ]
    };
  });

  return (
    <Animated.Image
      source={product.image}
      style={[mobileStyles.productImage, prodAnimatedStyle]}
      resizeMode="contain"
    />
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
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState<'product' | 'collection'>('product');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleIndexChange = (newIndex: number) => {
    setCurrentIndex((prev) => prev !== newIndex ? newIndex : prev);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      runOnJS(handleIndexChange)(Math.round(event.contentOffset.x / width));
    },
  });

  // Dynamic base floor shadow adapting to themes
  const podiumShadowStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      [0, width, width * 2],
      ['rgba(0, 150, 255, 0.6)', 'rgba(255, 170, 0, 0.6)', 'rgba(255, 120, 150, 0.6)']
    );
    return { backgroundColor };
  });

  const isCollection = currentPage === 'collection';

  return (
    <View style={styles.container}>

      {/* Navbar (Fixed - always visible) */}
      <View style={[styles.navbar, isMobile && mobileStyles.navbar, isCollection && { backgroundColor: 'rgba(250,247,242,0.97)', ...Platform.select({ web: { backdropFilter: 'blur(16px)' } }) }]}>
        <Image
          source={require('./assets/logo.png')}
          style={isMobile ? mobileStyles.logo : styles.logo}
          resizeMode="contain"
        />
        {/* Desktop nav links */}
        {!isMobile && (
          <View style={[styles.navLinks, isCollection && { backgroundColor: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.08)' }]}>
            <TouchableOpacity onPress={() => setCurrentPage('product')}>
              <Text style={currentPage === 'product' ? styles.navLinkActive : (isCollection ? [styles.navLink, { color: '#1a1a1a' }] : styles.navLink)}>Product</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentPage('collection')}>
              <Text style={currentPage === 'collection' ? styles.navLinkActive : (isCollection ? [styles.navLink, { color: '#1a1a1a' }] : styles.navLink)}>Collection</Text>
            </TouchableOpacity>
            <Text style={isCollection ? [styles.navLink, { color: '#1a1a1a' }] : styles.navLink}>Our Story</Text>
            <Text style={isCollection ? [styles.navLink, { color: '#1a1a1a' }] : styles.navLink}>Contact</Text>
          </View>
        )}
        {/* Mobile + Desktop right icons */}
        <View style={isMobile ? mobileStyles.navIcons : styles.navIcons}>
          {isMobile && (
            <TouchableOpacity style={[styles.iconBtn, isCollection && { backgroundColor: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.08)' }]} onPress={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X color={isCollection ? '#1a1a1a' : '#fff'} size={20} /> : <Menu color={isCollection ? '#1a1a1a' : '#fff'} size={20} />}
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.iconBtn, isCollection && { backgroundColor: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.08)' }]}>
            <User color={isCollection ? '#1a1a1a' : '#fff'} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, isCollection && { backgroundColor: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.08)' }]}>
            <ShoppingCart color={isCollection ? '#1a1a1a' : '#fff'} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mobile Menu Overlay */}
      {isMobile && menuOpen && (
        <View style={mobileStyles.menuOverlay}>
          <View style={mobileStyles.menuContent}>
            {(['product', 'collection', 'our-story', 'contact'] as const).map((page) => {
              const label = page === 'product' ? 'PRODUCT' : page === 'collection' ? 'COLLECTION' : page === 'our-story' ? 'OUR STORY' : 'CONTACT';
              return (
                <TouchableOpacity
                  key={page}
                  onPress={() => {
                    if (page === 'product') setCurrentPage('product');
                    else if (page === 'collection') setCurrentPage('collection');
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
        <>
          {/* BACKGROUND IMAGES */}
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {PRODUCTS.map((product, index) => (
              <BackgroundImageLayer key={`bg-${product.id}`} product={product} index={index} scrollX={scrollX} />
            ))}
          </View>

          {/* FLOATING PETALS AND BUBBLES FOR FACE SERUM & NIGHT CREAM */}
          <FloatingPetals scrollX={scrollX} index={0} source={require('./assets/blue_petals.png')} />
          <FloatingBubbles scrollX={scrollX} index={0} source={require('./assets/blue_bubblu_kutti.png')} />
          <FloatingGoldenBubbles scrollX={scrollX} index={1} />
          <FloatingPetals scrollX={scrollX} index={2} />
          <FloatingBubbles scrollX={scrollX} index={2} />

          {/* Main Horizontal Scrollable Area */}
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            style={StyleSheet.absoluteFill}
          >
            {PRODUCTS.map((product, index) =>
              isMobile
                ? <MobilePageContent key={product.id} product={product} index={index} scrollX={scrollX} />
                : <PageContent key={product.id} product={product} index={index} scrollX={scrollX} />
            )}
          </Animated.ScrollView>

          {/* Shared Absolute Product Image Container */}
          <View style={isMobile ? mobileStyles.centerProductWrapper : styles.centerProductWrapper} pointerEvents="none">

            {isMobile ? (
              <>
                {/* Mobile: Podium + Products */}
                <Animated.View style={[mobileStyles.podiumContainer]}>
                  <Animated.View style={[mobileStyles.podiumFloorShadow, podiumShadowStyle]} />
                  <Image
                    source={require('./assets/podium_custom.png')}
                    style={mobileStyles.podiumImage}
                    resizeMode="contain"
                  />
                </Animated.View>
                {PRODUCTS.map((product, index) => (
                  <MobileProductItem key={product.id} product={product} index={index} scrollX={scrollX} />
                ))}
              </>
            ) : (
              <>
                {/* Desktop: Original Podium + Products */}
                <Animated.View style={[styles.podiumContainer]}>
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
                    style={styles.navArrow}
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
                    style={styles.navArrow}
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
          <View style={isMobile ? mobileStyles.footer : styles.footer} pointerEvents="none">
            <Sparkles color="#ffffff" size={isMobile ? 12 : 16} style={{ marginRight: 8, opacity: 0.5 }} />
            <Text style={isMobile ? mobileStyles.footerText : styles.footerText}>
              Dermal-Grade Botanical Formula, ISO & GMP Certified. Made in India.
            </Text>
          </View>
        </>
      )}

      {/* ===== COLLECTION PAGE ===== */}
      {currentPage === 'collection' && (
        <CollectionPage
          onNavigateToProduct={(index: number) => {
            setCurrentPage('product');
            setTimeout(() => {
              scrollRef.current?.scrollTo({ x: index * width, y: 0, animated: false });
              setCurrentIndex(index);
            }, 100);
          }}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 30,
    padding: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
    borderColor: 'rgba(255,255,255,0.3)',
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
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.5,
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
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 90,
    paddingBottom: 50,
  },
  topTextSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 50,
    marginBottom: 12,
    letterSpacing: -1,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  separator: {
    width: 40,
    height: 3,
    marginBottom: 14,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
    textAlign: 'center',
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 6,
    textAlign: 'center',
  },
  size: {
    fontSize: 11,
    opacity: 0.7,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  imageSpace: {
    flex: 1,
    minHeight: height * 0.28,
  },
  bottomSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  benefitsContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '400',
    opacity: 0.95,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.85,
    marginBottom: 20,
    maxWidth: 320,
    fontWeight: '300',
  },
  price: {
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  buyBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  buyBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Mobile product image
  centerProductWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  productImage: {
    position: 'absolute',
    height: height * 0.42,
    width: width * 0.65,
    top: height * 0.22,
  },
  podiumContainer: {
    position: 'absolute',
    top: height * 0.52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumImage: {
    width: width * 0.75,
    height: width * 0.75 * (468 / 1380),
    transform: [{ scaleY: 0.85 }],
  },
  podiumFloorShadow: {
    position: 'absolute',
    bottom: -10,
    width: width * 0.6,
    height: 30,
    borderRadius: 999,
    ...Platform.select({ web: { filter: 'blur(20px)' } }),
    opacity: 0.7,
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

