import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Platform } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
import { User, ShoppingCart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';

const { height, width } = Dimensions.get('window');

const PRODUCTS = [
  {
    id: 1,
    title: 'Reveal\nYour Glow',
    subtitle: 'Ultra Sensitive Glow & Correct',
    name: 'FACE SERUM',
    description: 'Discover a world of radiant skin with our ultra-sensitive glow & correct serum. We believe in the power of dermal-grade botanicals to bring you luminous skin.',
    price: '₹4,150',
    size: '30 ml (1.0 fl oz)',
    theme: { bgCenter: '#FFDF00', bgEdge: '#4A3300', bg: '#0b161e', glow1: '#FFF275', glow2: '#FFD700', text: '#FFFFFF', accent: '#FFDF00' },
    benefits: ['Correct Tone.', 'Boost Glow.', 'Stay Calm.'],
    image: require('./assets/product2.png') // Gold bottle
  },
  {
    id: 2,
    title: 'Weightless\nPerfection',
    subtitle: 'Ultra Sensitive Smooth',
    name: 'HAIR SERUM',
    description: 'Dermal-Grade Botanical Formula. Weightless Smoothness, Natural Shine. Zero Silicone Feel. Your hair, perfected.',
    price: '₹2,100',
    size: '30 ml (1.0 fl oz)',
    theme: { bgCenter: '#005F73', bgEdge: '#001a24', bg: '#031926', glow1: '#00B4D8', glow2: '#0077B6', text: '#FFFFFF', accent: '#48CAE4' },
    benefits: ['Weightless.', 'Natural Shine.', 'Zero Silicone.'],
    image: require('./assets/product1.png') // Black pump bottle
  },
  {
    id: 3,
    title: 'Overnight\nRestoration',
    subtitle: 'Ultra Sensitive Repair',
    name: 'NIGHT CREAM',
    description: 'Dermal-Grade Botanical Formula. Gentle, Overnight Restoration. Your skin, renewed.',
    price: '₹2,100',
    size: '30g (1.0 oz)',
    theme: { bgCenter: '#632532', bgEdge: '#1a060a', bg: '#2b1016', glow1: '#FFB5A7', glow2: '#F08080', text: '#FFFFFF', accent: '#FFB5A7' },
    benefits: ['Repair Overnight.', 'Restore Calm.', 'Wake Up Renewed.'],
    image: require('./assets/product3.png') // Pink jar
  }
];

const RadialBackground = ({ product, index, scrollX }: any) => {
  const bgOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  if (Platform.OS !== 'web' || index >= 2) return null;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        bgOpacityStyle,
        { backgroundImage: `radial-gradient(circle at 40% 50%, ${product.theme.bgCenter} 0%, ${product.theme.bgEdge} 80%)` } as any
      ]}
    />
  );
};

export default function App() {
  const scrollRef = React.useRef<any>(null);
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleIndexChange = (newIndex: number) => {
    setCurrentIndex((prev) => prev !== newIndex ? newIndex : prev);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      runOnJS(handleIndexChange)(Math.round(event.contentOffset.x / width));
    },
  });

  // Use native CSS radial gradients on Web for the ultimate smooth 2-color center outward look.
  const bgAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      [0, width, width * 2],
      [PRODUCTS[0].theme.bg, PRODUCTS[1].theme.bg, PRODUCTS[2].theme.bg]
    );
    return { backgroundColor };
  });

  const orb1Style = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      [0, width, width * 2],
      [width * 0.1, -width * 0.2, width * 0.3]
    );
    const backgroundColor = interpolateColor(
      scrollX.value,
      [0, width, width * 2],
      [PRODUCTS[0].theme.glow1, PRODUCTS[1].theme.glow1, PRODUCTS[2].theme.glow1]
    );
    return { transform: [{ translateX }], backgroundColor };
  });

  const orb2Style = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      [0, width, width * 2],
      [-width * 0.2, width * 0.4, -width * 0.1]
    );
    const translateY = interpolate(
      scrollX.value,
      [0, width, width * 2],
      [height * 0.1, -height * 0.2, height * 0.3]
    );
    const backgroundColor = interpolateColor(
      scrollX.value,
      [0, width, width * 2],
      [PRODUCTS[0].theme.glow2, PRODUCTS[1].theme.glow2, PRODUCTS[2].theme.glow2]
    );
    return { transform: [{ translateX }, { translateY }], backgroundColor };
  });

  const PageContent = ({ product, index }: any) => {
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
          <View style={styles.leftCol}>
            <Text style={[styles.title, { color: product.theme.accent }]}>{product.title}</Text>
            <View style={styles.separator} />
            <Text style={styles.subtitle}>{product.subtitle}</Text>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.size}>{product.size}</Text>
            <Text style={styles.description}>{product.description}</Text>
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

  return (
    <Animated.View style={[styles.container, bgAnimatedStyle]}>

      {/* GLOWING ORBS */}
      <Animated.View style={[styles.glowOrb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.glowOrb, styles.orb2, orb2Style]} />

      {/* Fixed Radial Gradient Layers for Pages 1 and 2 (Eliminates Scroll Edge Tearing) */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {PRODUCTS.map((product, index) => (
          <RadialBackground key={`bg-${product.id}`} product={product} index={index} scrollX={scrollX} />
        ))}
      </View>

      {/* Navbar (Fixed) */}
      <View style={styles.navbar}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.navLinks}>
          <Text style={styles.navLinkActive}>Product</Text>
          <Text style={styles.navLink}>Collection</Text>
          <Text style={styles.navLink}>Our Story</Text>
          <Text style={styles.navLink}>Contact</Text>
        </View>
        <View style={styles.navIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <User color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <ShoppingCart color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

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
        {PRODUCTS.map((product, index) => (
          <PageContent key={product.id} product={product} index={index} />
        ))}
      </Animated.ScrollView>

      {/* Shared Absolute Product Image Container */}
      <View style={styles.centerProductWrapper} pointerEvents="none">
        {PRODUCTS.map((product, index) => {

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

            return {
              opacity,
              transform: [
                { translateX },
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

            // Shift shadow slightly right to simulate lighting from top-left, and dynamic Y positioning based on bottle height
            const translateYPositions = [height * 0.28, height * 0.35, height * 0.20]; // Product 2 needs lower shadow due to increased scale

            return {
              opacity,
              transform: [
                { translateX: translateX + 15 },
                { translateY: translateYPositions[index] }, // Push right under the base of the image
                { scaleX: scale * 1.5 },
                { scaleY: scale * 0.25 }
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
        })}
      </View>

      {/* Global Foreground Glass Elements (Arrows) */}
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

      {/* Bottom Legal / Trust Footer */}
      <View style={styles.footer} pointerEvents="none">
        <Sparkles color="#ffffff" size={16} style={{ marginRight: 8, opacity: 0.5 }} />
        <Text style={styles.footerText}>
          Dermal-Grade Botanical Formula. ISO & GMP Certified. Made in India.
        </Text>
      </View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.8,
    ...Platform.select({ web: { filter: 'blur(150px)' } })
  },
  orb1: {
    width: width * 0.6,
    height: width * 0.6,
    top: '-10%',
    left: '-10%',
  },
  orb2: {
    width: width * 0.5,
    height: width * 0.5,
    bottom: '-10%',
    right: '-5%',
  },
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
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
    textShadowColor: 'rgba(0,0,0,0.3)',
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
  },
  productImage: {
    position: 'absolute',
    height: height * 0.75, // Scaled up slightly
    width: width * 0.4,
    // Note: removed standard shadow on image to make custom shadow `productShadow` look more realistic
  },
  productShadow: {
    position: 'absolute',
    width: 250,
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 999,
    ...Platform.select({ web: { filter: 'blur(20px)' } }),
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
});
