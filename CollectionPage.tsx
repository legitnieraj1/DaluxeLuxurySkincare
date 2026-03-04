import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  SlideInRight,
  SlideOutRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  ShoppingCart,
  X,
  Star,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  Leaf,
  Droplets,
  Shield,
  Gift,
  Award,
  ArrowLeft,
} from 'lucide-react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ════════════════════════════════════════════════
// LUXURY LIGHT THEME
// ════════════════════════════════════════════════
const CREAM = '#FAF7F2';
const CREAM_WARM = '#F5F0E8';
const CREAM_SOFT = '#FFF9F0';
const GOLD = '#C9A84C';
const GOLD_LIGHT = 'rgba(201,168,76,0.12)';
const GOLD_BORDER = 'rgba(201,168,76,0.25)';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#555555';
const TEXT_MUTED = '#999999';
const TEXT_LIGHT = '#bbbbbb';
const BORDER = 'rgba(0,0,0,0.08)';
const BORDER_GOLD = 'rgba(201,168,76,0.3)';
const WHITE = '#ffffff';
const SERIF = Platform.select({
  web: 'Georgia, "Playfair Display", "Times New Roman", serif',
  default: undefined,
});

// ════════════════════════════════════════════════
// PRODUCT DATA
// ════════════════════════════════════════════════
const COLLECTION_PRODUCTS = [
  {
    id: 'facewash',
    name: 'ULTRA SENSITIVE GOLD GLOW FACEWASH',
    shortName: 'FACEWASH',
    displayName: 'Gold Glow Facewash',
    subtitle: 'Ultra Sensitive Gold Glow',
    category: 'cleanse',
    tagline: 'Gentle Luxury Cleanse with Gold Glow & Herbal Care',
    price: 249,
    priceDisplay: '\u20B9249.00',
    size: '100 ML',
    sizeDetail: '100 ml (3.38 fl oz)',
    rating: 4.8,
    image: require('./assets/facewash.jpeg'),
    themeColor: '#4A7C59',
    themeBg: '#EDF4ED',
    themeGradient: ['#EDF4ED', '#F5F9F5'] as [string, string],
    highlights: [
      { icon: 'leaf', label: 'Crystal clear gel with real gold flakes' },
      { icon: 'droplets', label: 'Ultra gentle sulphate-free cleansing' },
      { icon: 'sparkles', label: 'Herbal glow boosting formula' },
    ],
    benefits: [
      'Deep yet gentle cleansing',
      'Instant freshness & soft glow',
      'Helps reduce redness & irritation',
      'Hydrates and soothes skin',
      'Promotes radiant complexion',
    ],
    concerns: ['Dullness', 'Mild Redness', 'Sensitivity', 'Dehydrated Skin', 'Uneven Texture'],
    description: 'A luxurious crystal clear gel facewash infused with herbal extracts, hydrosols and real gold flakes that gently cleanses impurities while soothing sensitive skin and enhancing natural glow.',
    storyTitle: 'The Gold Glow Ritual',
    storyText: 'Infused with 24K Gold Leaf and Kumkumadi Taila, this crystal-clear gel transforms your daily cleanse into a luxurious botanical ritual. Each wash reveals softer, more radiant skin with a golden luminescence.',
    stats: [
      { value: '98%', label: 'FELT SOFTER SKIN' },
      { value: '95%', label: 'VISIBLE GLOW' },
      { value: '92%', label: 'REDUCED REDNESS' },
    ],
    featuredIngredients: [
      { name: 'Rose Hydrosol', desc: 'A gentle floral water that soothes, tones and hydrates sensitive skin while reducing redness.' },
      { name: 'Saffron Extract', desc: 'The golden spice that brightens complexion, evens skin tone and imparts a natural luminous glow.' },
      { name: '24K Gold Leaf', desc: 'Pure gold particles that boost radiance, stimulate cell renewal and add luxurious luminescence.' },
    ],
    allIngredients: ['Rose Hydrosol', 'Saffron Extract', 'Licorice Extract', 'Manjistha', 'Amla', 'Gotu Kola', 'Chamomile', 'Sandalwood', 'Lotus', 'Neem', 'Tulsi', 'Organic Honey', 'Vitamin E', 'Kumkumadi Taila', 'Gold Nano Dust', '24K Gold Leaf'],
    texture: 'Lightweight crystal clear gel with visible gold flakes',
    fragrance: 'Soft floral luxury fragrance with rose & saffron notes',
    howToUse: 'Take a small amount on wet face, gently massage in circular motion and rinse with water. Pat dry.',
    whenToUse: 'Morning & Night (twice daily)',
    suitableFor: ['All Skin Types', 'Sensitive Skin'],
    claims: ['Sulphate Free', 'Paraben Free', 'Soap Free', 'Gentle Surfactants', 'pH Balanced', 'Dermatologically Inspired'],
    shelfLife: '24 Months',
    storage: 'Store in cool & dry place. Keep away from direct sunlight.',
    safety: 'For external use only. Avoid contact with eyes. Patch test recommended.',
    reviews: [
      { text: 'Very gentle and leaves my skin soft with a beautiful natural glow. The gold flakes are such a luxurious touch.', author: 'Priya M.', rating: 5 },
      { text: 'Perfect for sensitive skin! Cleans well without any dryness or tightness.', author: 'Ananya R.', rating: 5 },
      { text: 'Light gel formula that hydrates and gives a fresh radiant look every morning.', author: 'Deepika S.', rating: 5 },
    ],
  },
  {
    id: 'hairserum',
    name: 'ULTRA SENSITIVE SMOOTH & SHINE HAIR SERUM',
    shortName: 'HAIR SERUM',
    displayName: 'Smooth & Shine Hair Serum',
    subtitle: 'Ultra Sensitive Smooth',
    category: 'hair',
    tagline: 'Weightless Smoothness \u00B7 Natural Shine \u00B7 Zero Silicone Feel',
    price: 349,
    priceDisplay: '\u20B9349.00',
    size: '30 ML',
    sizeDetail: '30 ml (1.0 fl oz)',
    rating: 4.8,
    image: require('./assets/hair serum.png'),
    themeColor: '#108cba',
    themeBg: '#E8F4FA',
    themeGradient: ['#E8F4FA', '#F0F8FC'] as [string, string],
    highlights: [
      { icon: 'droplets', label: 'Ultra-light nourishing oil blend' },
      { icon: 'leaf', label: 'Ayurvedic scalp-friendly actives' },
      { icon: 'sparkles', label: 'Smooth & shine boosting formula' },
    ],
    benefits: [
      'Adds natural shine and smoothness',
      'Helps control frizz and dryness',
      'Nourishes scalp without heaviness',
    ],
    concerns: ['Dry Hair', 'Frizz', 'Rough Texture', 'Sensitive Scalp'],
    description: 'A lightweight leave-in hair serum formulated with botanical oils and Ayurvedic extracts to smooth frizz, enhance shine and nourish scalp gently without greasy residue.',
    storyTitle: 'Weightless Botanical Perfection',
    storyText: 'A carefully crafted blend of Argan, Jojoba and Bhringraj oils combined with Ayurvedic scalp-friendly extracts. This silicone-free formula delivers weightless smoothness and natural mirror-like shine.',
    stats: [
      { value: '96%', label: 'SMOOTHER HAIR' },
      { value: '93%', label: 'REDUCED FRIZZ' },
      { value: '97%', label: 'NATURAL SHINE' },
    ],
    featuredIngredients: [
      { name: 'Argan Oil', desc: 'Liquid gold from Morocco that deeply nourishes, tames frizz and adds a brilliant, healthy shine.' },
      { name: 'Bhringraj Oil', desc: 'The king of Ayurvedic hair herbs, strengthening roots, promoting growth and restoring natural vitality.' },
      { name: 'Olive Squalane', desc: 'A lightweight botanical emollient that seals moisture, smooths cuticles and adds weightless silk.' },
    ],
    allIngredients: ['Coconut MCT Oil', 'Jojoba Oil', 'Argan Oil', 'Sweet Almond Oil', 'Bhringraj Oil', 'Hibiscus Extract', 'Licorice Extract', 'Fenugreek Extract', 'Olive Squalane', 'Vitamin E'],
    texture: 'Ultra-light, Non-sticky, Silky',
    fragrance: 'Mild natural fragrance',
    howToUse: 'Take a few drops, apply on hair lengths and ends, and gently smooth through.',
    whenToUse: 'Daily / After Wash / Styling',
    suitableFor: ['Normal Hair', 'Sensitive & Dry Hair', 'Sensitive Scalp'],
    claims: ['Silicone Free', 'Lightweight', 'Non-sticky', 'Gentle Botanical Formula'],
    shelfLife: '24 Months',
    storage: 'Store in a cool & dry place away from direct sunlight.',
    safety: 'For external use only. Avoid contact with eyes.',
    reviews: [
      { text: 'Smooth and shiny finish without any heaviness. My hair has never looked better.', author: 'Sneha K.', rating: 5 },
      { text: 'Lightweight and non-greasy, perfect for my daily routine. Love the natural fragrance.', author: 'Kavya P.', rating: 5 },
      { text: 'Perfect for sensitive scalp care and frizz control. Finally a serum that works!', author: 'Riya T.', rating: 4 },
    ],
  },
  {
    id: 'faceserum',
    name: 'ULTRA SENSITIVE GLOW & CORRECT FACE SERUM',
    shortName: 'FACE SERUM',
    displayName: 'Glow & Correct Face Serum',
    subtitle: 'Ultra Sensitive Glow & Correct',
    category: 'serum',
    tagline: 'Gentle Brightening \u00B7 No Irritation \u00B7 Daily Glow Boost',
    price: 449,
    priceDisplay: '\u20B9449.00',
    size: '30 ML',
    sizeDetail: '30 ml (1.0 fl oz)',
    rating: 4.8,
    image: require('./assets/faceserum.png'),
    themeColor: '#1BA8A0',
    themeBg: '#E5F5F3',
    themeGradient: ['#E5F5F3', '#EFF9F8'] as [string, string],
    highlights: [
      { icon: 'droplets', label: 'Soothing hydrosol-based formula' },
      { icon: 'sparkles', label: 'Mild pigmentation correcting actives' },
      { icon: 'leaf', label: 'Lightweight hydration & barrier support' },
    ],
    benefits: [
      'Helps brighten and even skin tone',
      'Reduces mild pigmentation & dullness',
      'Deep hydration with calming effect',
    ],
    concerns: ['Pigmentation', 'Dull Skin', 'Sensitivity', 'Uneven Tone'],
    description: 'A gentle face serum formulated with hydrosols, botanical extracts and mild actives to brighten skin, reduce pigmentation and provide soothing hydration without irritation.',
    storyTitle: 'The Science of Gentle Brightening',
    storyText: 'Combining Alpha Arbutin with Vitamin C and Bakuchiol in a hydrosol base, this serum delivers visible brightening without the irritation. Sensitive skin finally gets the glow treatment it deserves.',
    stats: [
      { value: '94%', label: 'EVEN SKIN TONE' },
      { value: '97%', label: 'HYDRATED SKIN' },
      { value: '91%', label: 'REDUCED PIGMENTATION' },
    ],
    featuredIngredients: [
      { name: 'Alpha Arbutin', desc: 'A gentle yet effective brightening agent that reduces dark spots and evens skin tone without irritation.' },
      { name: 'Vitamin C', desc: 'A powerful antioxidant that boosts collagen, brightens complexion and protects against environmental stress.' },
      { name: 'Bakuchiol', desc: 'Nature\u2019s retinol alternative. Smooths fine lines and improves texture without any sensitivity.' },
    ],
    allIngredients: ['Aloe Vera', 'Rose Hydrosol', 'Licorice Extract', 'Alpha Arbutin', 'Gotu Kola', 'Vitamin C', 'Panthenol', 'Sodium Hyaluronate', 'Chamomile', 'Bakuchiol'],
    texture: 'Lightweight, Gel-serum, Non-sticky',
    fragrance: 'Mild natural fragrance',
    howToUse: 'Apply 2\u20133 drops on clean face and gently pat until absorbed.',
    whenToUse: 'AM & PM / Daily',
    suitableFor: ['Sensitive Skin', 'Very Sensitive Skin', 'Normal Skin'],
    claims: ['No Tingling', 'No Irritation', 'Alcohol Free', 'Gentle Brightening Formula'],
    shelfLife: '24 Months',
    storage: 'Store in a cool & dry place away from direct sunlight.',
    safety: 'For external use only. Avoid contact with eyes. Patch test recommended.',
    reviews: [
      { text: 'Lightweight and soothing serum. My skin glows without any irritation at all.', author: 'Meera J.', rating: 5 },
      { text: 'Gentle glow boost that works beautifully on my sensitive skin. No redness!', author: 'Aisha N.', rating: 5 },
      { text: 'Hydrating and non-sticky feel. I can see my pigmentation fading already.', author: 'Tanvi G.', rating: 5 },
    ],
  },
  {
    id: 'nightcream',
    name: 'ULTRA SENSITIVE REPAIR NIGHT CREAM',
    shortName: 'NIGHT CREAM',
    displayName: 'Repair Night Cream',
    subtitle: 'Ultra Sensitive Repair',
    category: 'night',
    tagline: 'Low Irritation \u00B7 Acne Safe \u00B7 Overnight Skin Repair',
    price: 399,
    priceDisplay: '\u20B9399.00',
    size: '30 G',
    sizeDetail: '30g / 1.0 fl oz',
    rating: 4.8,
    image: require('./assets/nightcream.png'),
    themeColor: '#8B2252',
    themeBg: '#F6ECF0',
    themeGradient: ['#F6ECF0', '#FAF3F6'] as [string, string],
    highlights: [
      { icon: 'leaf', label: 'Botanical calming hydrosol base' },
      { icon: 'droplets', label: 'Lightweight nourishing oils' },
      { icon: 'sparkles', label: 'Active soothing & brightening complex' },
    ],
    benefits: [
      'Calms and repairs sensitive skin',
      'Provides deep overnight hydration',
      'Improves softness and natural glow',
    ],
    concerns: ['Dryness', 'Sensitivity', 'Dull Skin', 'Mild Acne'],
    description: 'A gentle night cream formulated with hydrosols, botanical extracts and vitamins to calm, hydrate and repair skin overnight, leaving it soft, smooth and radiant.',
    storyTitle: 'Overnight Botanical Restoration',
    storyText: 'While you sleep, a potent blend of Rose Hydrosol, Squalane and Niacinamide works to calm irritation, deeply hydrate and repair your skin\u2019s natural barrier. Wake up to visibly softer, renewed skin.',
    stats: [
      { value: '96%', label: 'DEEPER HYDRATION' },
      { value: '94%', label: 'SOFTER SKIN' },
      { value: '98%', label: 'CALMER COMPLEXION' },
    ],
    featuredIngredients: [
      { name: 'Squalane', desc: 'A luxurious plant-derived oil identical to skin\u2019s own moisture. Deeply nourishes without clogging pores.' },
      { name: 'Niacinamide', desc: 'Vitamin B3 that strengthens the skin barrier, reduces redness and improves overall skin texture and tone.' },
      { name: 'Rose Hydrosol', desc: 'The essence of Bulgarian roses. Calms inflammation, balances pH and envelops skin in gentle hydration.' },
    ],
    allIngredients: ['Rose Hydrosol', 'Aloe Vera', 'Squalane', 'Jojoba Oil', 'Licorice Extract', 'Gotu Kola', 'Niacinamide', 'Chamomile', 'Panthenol', 'Vitamin E'],
    texture: 'Lightweight, Creamy, Non-greasy',
    fragrance: 'Mild hypoallergenic fragrance',
    howToUse: 'Apply a small amount on clean face at night and massage gently until absorbed.',
    whenToUse: 'Night / Daily',
    suitableFor: ['Normal Skin', 'Dry Skin', 'Sensitive Skin', 'Acne-prone Skin'],
    claims: ['Low Irritation', 'Acne Safe', 'Alcohol Free', 'Retinol Free', 'Gentle Botanical Formula'],
    shelfLife: '24 Months',
    storage: 'Store in a cool & dry place away from direct sunlight.',
    safety: 'For external use only. Avoid contact with eyes. Patch test recommended.',
    reviews: [
      { text: 'Gentle and soothing for sensitive skin. I wake up feeling truly refreshed and renewed.', author: 'Nisha D.', rating: 5 },
      { text: 'Deep hydration with soft glow. My skin has never been this calm overnight.', author: 'Pooja V.', rating: 5 },
      { text: 'Lightweight and non-greasy formula that actually works. My acne hasn\u2019t flared up since!', author: 'Shruti L.', rating: 5 },
    ],
  },
];

type ProductType = typeof COLLECTION_PRODUCTS[0];
type CartItem = { product: ProductType; quantity: number };

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'cleanse', label: 'CLEANSE' },
  { id: 'serum', label: 'SERUMS' },
  { id: 'hair', label: 'HAIR CARE' },
  { id: 'night', label: 'NIGHT CARE' },
];

// ════════════════════════════════════════════════
// HELPER COMPONENTS
// ════════════════════════════════════════════════

const IconForType = ({ type, color, size = 18 }: { type: string; color: string; size?: number }) => {
  switch (type) {
    case 'leaf': return <Leaf color={color} size={size} />;
    case 'droplets': return <Droplets color={color} size={size} />;
    case 'shield': return <Shield color={color} size={size} />;
    default: return <Sparkles color={color} size={size} />;
  }
};

// ════════════════════════════════════════════════
// COLLECTION HERO SPLASH
// ════════════════════════════════════════════════
const CollectionHero = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Subtle, luxurious slow-breathing zoom
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={g.splashHeroContainer}>
      <Animated.View style={[g.splashImageWrapper, animatedStyle]}>
        <Image
          source={require('./assets/splash_hero.jpg')}
          style={[{ width: '100%', height: '100%' }, Platform.select({ web: { objectPosition: 'center' } as any })]}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.1)' }]} pointerEvents="none" />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(800)} style={g.splashTextContent}>
        <Text style={g.splashOverline}>DISCOVER</Text>
        <Text style={g.splashTitle}>THE D A LUXE COLLECTION</Text>
        <Text style={g.splashSubtitle}>
          Dermal-Grade Botanical Skincare{'\n'}Designed for Sensitive Perfection.
        </Text>
      </Animated.View>
    </View>
  );
};

// ════════════════════════════════════════════════
// COLLECTION GRID VIEW
// ════════════════════════════════════════════════
const CollectionGrid = ({
  activeCategory,
  setActiveCategory,
  products,
  onSelectProduct,
}: {
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  products: ProductType[];
  onSelectProduct: (p: ProductType) => void;
}) => {
  return (
    <>
      {/* Splash Hero Introduction */}
      <CollectionHero />

      {/* Hero */}
      <View style={g.hero}>
        <Animated.View entering={FadeInDown.duration(600)} style={g.heroInner}>
          <View style={g.heroGoldLine} />
          <Text style={g.heroTitle}>The Collection</Text>
          <View style={g.heroGoldLine} />
        </Animated.View>

        {/* Category Selector */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={g.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[g.categoryBtn, activeCategory === cat.id && g.categoryBtnActive]}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={[g.categoryBtnText, activeCategory === cat.id && g.categoryBtnTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

      {/* Product Grid */}
      <View style={g.grid}>
        {products.map((product, index) => (
          <Animated.View
            key={product.id}
            entering={FadeInUp.delay(index * 120).duration(500)}
          >
            <Pressable
              style={({ hovered }: any) => [
                g.card,
                hovered && Platform.OS === 'web' && g.cardHovered,
              ]}
              onPress={() => onSelectProduct(product)}
            >
              {/* Product Image */}
              <View style={[g.cardImageArea, { backgroundColor: product.themeBg }]}>
                <Image source={product.image} style={g.cardImage} resizeMode="contain" />
              </View>

              {/* Card Info */}
              <View style={g.cardInfo}>
                <Text style={g.cardSubtitle}>{product.subtitle}</Text>
                <Text style={g.cardName}>{product.shortName}</Text>
                <Text style={g.cardDesc} numberOfLines={2}>{product.description}</Text>
                <Text style={g.cardPrice}>{product.priceDisplay}</Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {products.length === 0 && (
          <View style={g.emptyState}>
            <Text style={g.emptyText}>No products match this category.</Text>
            <TouchableOpacity onPress={() => setActiveCategory('all')}>
              <Text style={g.resetText}>View All Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Trust Section */}
      <View style={g.trustSection}>
        <View style={g.trustRow}>
          <View style={g.trustItem}>
            <Gift color={GOLD} size={28} />
            <Text style={g.trustItemTitle}>Exclusive Formulas</Text>
            <Text style={g.trustItemSub}>Dermal-grade botanicals</Text>
          </View>
          <View style={g.trustItem}>
            <Award color={GOLD} size={28} />
            <Text style={g.trustItemTitle}>ISO & GMP Certified</Text>
            <Text style={g.trustItemSub}>Quality guaranteed</Text>
          </View>
          <View style={g.trustItem}>
            <Shield color={GOLD} size={28} />
            <Text style={g.trustItemTitle}>Sensitive Safe</Text>
            <Text style={g.trustItemSub}>Gentle on all skin</Text>
          </View>
          <View style={g.trustItem}>
            <Leaf color={GOLD} size={28} />
            <Text style={g.trustItemTitle}>Made in India</Text>
            <Text style={g.trustItemSub}>Herbal extract based</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={g.footer}>
        <View style={g.footerLine} />
        <Image source={require('./assets/logo.png')} style={g.footerLogo} resizeMode="contain" />
        <Text style={g.footerText}>Dermal-Grade Botanical Formula</Text>
        <Text style={g.footerText}>ISO & GMP Certified {'\u00B7'} Made in India</Text>
        <View style={g.footerLine} />
      </View>

      <View style={{ height: 60 }} />
    </>
  );
};

// ════════════════════════════════════════════════
// PRODUCT DETAIL / LANDING PAGE (Valmont-style)
// ════════════════════════════════════════════════
const ProductLandingPage = ({
  product,
  onBack,
  onAddToCart,
  allProducts,
  onSelectProduct,
}: {
  product: ProductType;
  onBack: () => void;
  onAddToCart: (p: ProductType) => void;
  allProducts: ProductType[];
  onSelectProduct: (p: ProductType) => void;
}) => {
  const otherProducts = allProducts.filter((p) => p.id !== product.id);

  return (
    <>
      {/* ── Section 1: Product Hero ── */}
      <View style={d.heroSection}>
        {/* Breadcrumb */}
        <TouchableOpacity style={d.breadcrumb} onPress={onBack} activeOpacity={0.6}>
          <ArrowLeft color={TEXT_MUTED} size={16} />
          <Text style={d.breadcrumbText}>Collection</Text>
          <Text style={d.breadcrumbSep}>/</Text>
          <Text style={d.breadcrumbCurrent}>{product.displayName}</Text>
        </TouchableOpacity>

        <View style={d.heroRow}>
          {/* Product Image */}
          <Animated.View entering={FadeInLeft.duration(500)} style={d.heroImageCol}>
            <View style={[d.heroImageBg, { backgroundColor: product.themeBg }]}>
              <Image source={product.image} style={d.heroImage} resizeMode="contain" />
            </View>
          </Animated.View>

          {/* Product Info */}
          <Animated.View entering={FadeInRight.delay(200).duration(500)} style={d.heroInfoCol}>
            <Text style={d.heroSubtitle}>{product.subtitle}</Text>
            <Text style={d.heroName}>{product.shortName}</Text>
            <Text style={d.heroTagline}>{product.tagline}</Text>
            <Text style={d.heroDesc}>{product.description}</Text>

            <View style={d.heroDivider} />

            <View style={d.heroPriceRow}>
              <Text style={d.heroSize}>{product.size}</Text>
              <Text style={d.heroPrice}>{product.priceDisplay}</Text>
            </View>

            <TouchableOpacity
              style={d.addToCartBtn}
              onPress={() => onAddToCart(product)}
              activeOpacity={0.8}
            >
              <Text style={d.addToCartText}>ADD TO CART</Text>
            </TouchableOpacity>

            <View style={d.trustBadges}>
              <View style={d.trustBadge}>
                <Gift color={GOLD} size={16} />
                <Text style={d.trustBadgeText}>Exclusive gifts</Text>
              </View>
              <View style={d.trustBadge}>
                <Check color={GOLD} size={16} />
                <Text style={d.trustBadgeText}>Guaranteed authenticity</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* ── Section 2: Stats / Results ── */}
      <View style={d.statsSection}>
        <Text style={d.statsHeading}>Measured and{'\n'}perceived results</Text>
        <View style={d.statsRow}>
          {product.stats.map((stat, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(i * 150).duration(500)}
              style={d.statItem}
            >
              <Text style={[d.statValue, { color: product.themeColor }]}>{stat.value}</Text>
              <Text style={d.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ── Section 3: Product Story ── */}
      <View style={d.storySection}>
        <View style={[d.storyImageCol, { backgroundColor: product.themeBg }]}>
          <Image source={product.image} style={d.storyImage} resizeMode="contain" />
        </View>
        <View style={d.storyTextCol}>
          <Text style={d.storyTitle}>{product.storyTitle}</Text>
          <Text style={d.storyText}>{product.storyText}</Text>
          <Text style={d.storyDesc}>{product.description}</Text>
        </View>
      </View>

      {/* ── Section 4: Key Benefits ── */}
      <View style={d.benefitsSection}>
        <Text style={d.sectionHeading}>Key Benefits</Text>
        <View style={d.benefitsGrid}>
          <View style={d.benefitsListCol}>
            {product.benefits.map((b, i) => (
              <Animated.View
                key={i}
                entering={FadeInLeft.delay(i * 100).duration(400)}
                style={d.benefitItem}
              >
                <Text style={d.benefitNumber}>0{i + 1}</Text>
                <Text style={d.benefitText}>{b}</Text>
              </Animated.View>
            ))}
          </View>
        </View>
      </View>

      {/* ── Section 5: Ingredients (Valmont-style circular cards) ── */}
      <View style={d.ingredientsSection}>
        <Text style={d.sectionHeading}>What you put on{'\n'}your skin matters</Text>
        <View style={d.ingredientCardsRow}>
          {product.featuredIngredients.map((ing, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(i * 150).duration(500)}
              style={d.ingredientCard}
            >
              <View style={[d.ingredientCircle, { backgroundColor: product.themeBg, borderColor: product.themeColor + '30' }]}>
                <Sparkles color={product.themeColor} size={28} />
              </View>
              <Text style={d.ingredientName}>{ing.name}</Text>
              <Text style={d.ingredientDesc}>{ing.desc}</Text>
            </Animated.View>
          ))}
        </View>

        {/* All Ingredients List */}
        <View style={d.allIngredientsBox}>
          <Text style={d.allIngredientsTitle}>Full Ingredient List</Text>
          <Text style={d.allIngredientsList}>
            {product.allIngredients.join(' \u00B7 ')}
          </Text>
        </View>
      </View>

      {/* ── Section 6: Texture & How to Use ── */}
      <View style={d.usageSection}>
        <View style={d.usageGrid}>
          <View style={d.usageCol}>
            <Text style={d.usageColTitle}>Texture & Feel</Text>
            <Text style={d.usageText}>{product.texture}</Text>
            <View style={{ height: 16 }} />
            <Text style={d.usageSmallLabel}>Fragrance</Text>
            <Text style={d.usageText}>{product.fragrance}</Text>
          </View>
          <View style={d.usageDividerV} />
          <View style={d.usageCol}>
            <Text style={d.usageColTitle}>How to Use</Text>
            <Text style={d.usageText}>{product.howToUse}</Text>
            <View style={{ height: 16 }} />
            <View style={d.usageWhenRow}>
              {product.whenToUse.toLowerCase().includes('night') && <Moon color={product.themeColor} size={18} />}
              {(product.whenToUse.toLowerCase().includes('morning') || product.whenToUse.toLowerCase().includes('am')) && <Sun color={product.themeColor} size={18} />}
              {product.whenToUse.toLowerCase().includes('daily') && <Sparkles color={product.themeColor} size={18} />}
              <Text style={d.usageWhenText}>{product.whenToUse}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Section 7: This product is ideal for ── */}
      <View style={d.idealSection}>
        <Text style={d.idealTitle}>This product is ideal for</Text>
        <Text style={d.idealText}>{product.suitableFor.join(', ')}.</Text>
        <View style={d.claimsRow}>
          {product.claims.map((c, i) => (
            <View key={i} style={d.claimBadge}>
              <Check color={product.themeColor} size={14} />
              <Text style={d.claimText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Section 8: Reviews ── */}
      <View style={d.reviewsSection}>
        <Text style={d.reviewsHeading}>Customer Reviews</Text>
        <Text style={d.reviewsSubheading}>{product.displayName}</Text>
        <View style={d.reviewsStarsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} color={GOLD} size={20} fill={GOLD} />
          ))}
          <Text style={d.reviewsRating}>{product.rating} / 5</Text>
        </View>
        <View style={d.reviewsList}>
          {product.reviews.map((r, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(i * 100).duration(400)}
              style={d.reviewCard}
            >
              <View style={d.reviewStarsSmall}>
                {[1, 2, 3, 4, 5].map((j) => (
                  <Star key={j} color={GOLD} size={13} fill={j <= r.rating ? GOLD : 'transparent'} />
                ))}
              </View>
              <Text style={d.reviewText}>&ldquo;{r.text}&rdquo;</Text>
              <Text style={d.reviewAuthor}>{r.author}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ── Section 9: Discover More ── */}
      <View style={d.discoverSection}>
        <Text style={d.discoverHeading}>Discover the Collection</Text>
        <View style={d.discoverGrid}>
          {otherProducts.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={d.discoverCard}
              onPress={() => onSelectProduct(p)}
              activeOpacity={0.7}
            >
              <View style={[d.discoverImageBg, { backgroundColor: p.themeBg }]}>
                <Image source={p.image} style={d.discoverImage} resizeMode="contain" />
              </View>
              <Text style={d.discoverName}>{p.shortName}</Text>
              <Text style={d.discoverSub}>{p.description.slice(0, 60)}...</Text>
              <Text style={d.discoverPrice}>{p.priceDisplay}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={d.footerSection}>
        <View style={d.footerTrustRow}>
          <View style={d.footerTrustItem}>
            <Gift color={GOLD} size={22} />
            <Text style={d.footerTrustText}>Free Shipping{'\n'}over \u20B9500</Text>
          </View>
          <View style={d.footerTrustItem}>
            <Award color={GOLD} size={22} />
            <Text style={d.footerTrustText}>ISO & GMP{'\n'}Certified</Text>
          </View>
          <View style={d.footerTrustItem}>
            <Shield color={GOLD} size={22} />
            <Text style={d.footerTrustText}>Sensitive{'\n'}Skin Safe</Text>
          </View>
          <View style={d.footerTrustItem}>
            <Leaf color={GOLD} size={22} />
            <Text style={d.footerTrustText}>100% Botanical{'\n'}Ingredients</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 90 }} />
    </>
  );
};

// ════════════════════════════════════════════════
// STICKY BOTTOM BAR (Valmont-style)
// ════════════════════════════════════════════════
const StickyBottomBar = ({ product, onAddToCart }: { product: ProductType; onAddToCart: (p: ProductType) => void }) => {
  return (
    <View style={sb.container}>
      <View style={sb.inner}>
        <Image source={product.image} style={sb.image} resizeMode="contain" />
        <View style={sb.info}>
          <Text style={sb.name}>{product.displayName}</Text>
          <Text style={sb.sub}>{product.subtitle}</Text>
        </View>
        <Text style={sb.size}>{product.size}</Text>
        <Text style={sb.price}>{product.priceDisplay}</Text>
        <TouchableOpacity style={sb.cartBtn} onPress={() => onAddToCart(product)} activeOpacity={0.8}>
          <Text style={sb.cartBtnText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ════════════════════════════════════════════════
// CART DRAWER
// ════════════════════════════════════════════════
const CartDrawer = ({
  items, visible, onClose, onUpdateQuantity, onRemove,
}: {
  items: CartItem[]; visible: boolean; onClose: () => void;
  onUpdateQuantity: (id: string, qty: number) => void; onRemove: (id: string) => void;
}) => {
  if (!visible) return null;
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <Animated.View entering={SlideInRight.duration(300)} exiting={SlideOutRight.duration(200)} style={cart.drawer}>
      <View style={cart.header}>
        <Text style={cart.headerTitle}>Your Cart</Text>
        <TouchableOpacity onPress={onClose}><X color={TEXT_PRIMARY} size={22} /></TouchableOpacity>
      </View>
      <ScrollView style={cart.list} showsVerticalScrollIndicator={false}>
        {items.length === 0 && <Text style={cart.emptyText}>Your cart is empty</Text>}
        {items.map((item) => (
          <View key={item.product.id} style={cart.item}>
            <Image source={item.product.image} style={cart.itemImg} resizeMode="contain" />
            <View style={cart.itemInfo}>
              <Text style={cart.itemName}>{item.product.shortName}</Text>
              <Text style={cart.itemSize}>{item.product.sizeDetail}</Text>
              <Text style={cart.itemPrice}>{item.product.priceDisplay}</Text>
            </View>
            <View style={cart.qtyRow}>
              <TouchableOpacity style={cart.qtyBtn} onPress={() => item.quantity > 1 ? onUpdateQuantity(item.product.id, item.quantity - 1) : onRemove(item.product.id)}>
                <Text style={cart.qtyBtnText}>{'\u2212'}</Text>
              </TouchableOpacity>
              <Text style={cart.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={cart.qtyBtn} onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}>
                <Text style={cart.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      {items.length > 0 && (
        <View style={cart.footer}>
          <View style={cart.totalRow}>
            <Text style={cart.totalLabel}>Total</Text>
            <Text style={cart.totalValue}>{'\u20B9'}{total.toLocaleString('en-IN')}</Text>
          </View>
          <TouchableOpacity style={cart.checkoutBtn}><Text style={cart.checkoutText}>CHECKOUT</Text></TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

// ════════════════════════════════════════════════
// MAIN COLLECTION PAGE
// ════════════════════════════════════════════════
interface CollectionPageProps {
  onNavigateToProduct?: (index: number) => void;
  scrollY?: any;
}

export default function CollectionPage({ onNavigateToProduct, scrollY }: CollectionPageProps) {
  const [view, setView] = useState<'grid' | 'detail'>('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const filteredProducts = COLLECTION_PRODUCTS.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    return true;
  });

  const openProduct = useCallback((product: ProductType) => {
    setSelectedProduct(product);
    setView('detail');
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
  }, []);

  const goBack = useCallback(() => {
    setView('grid');
    setSelectedProduct(null);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
  }, []);

  const addToCart = useCallback((product: ProductType) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    setCartVisible(true);
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    setCartItems((prev) => prev.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i)));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== id));
  }, []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View style={main.container}>
      <Animated.ScrollView
        ref={scrollRef as any}
        style={main.scroll}
        contentContainerStyle={main.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e: any) => {
          if (scrollY) {
            scrollY.value = e.nativeEvent.contentOffset.y;
          }
        }}
      >
        {view === 'grid' && (
          <CollectionGrid
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            products={filteredProducts}
            onSelectProduct={openProduct}
          />
        )}

        {view === 'detail' && selectedProduct && (
          <ProductLandingPage
            product={selectedProduct}
            onBack={goBack}
            onAddToCart={addToCart}
            allProducts={COLLECTION_PRODUCTS}
            onSelectProduct={openProduct}
          />
        )}
      </Animated.ScrollView>

      {/* Sticky Bottom Bar (detail view only) */}
      {view === 'detail' && selectedProduct && (
        <StickyBottomBar product={selectedProduct} onAddToCart={addToCart} />
      )}

      {/* Floating Cart */}
      {cartCount > 0 && !cartVisible && (
        <Animated.View entering={FadeIn.duration(300)} style={main.floatingCart}>
          <TouchableOpacity style={main.floatingCartBtn} onPress={() => setCartVisible(true)} activeOpacity={0.8}>
            <ShoppingCart color={WHITE} size={20} />
            <View style={main.cartBadge}><Text style={main.cartBadgeText}>{cartCount}</Text></View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Cart Drawer */}
      <CartDrawer items={cartItems} visible={cartVisible} onClose={() => setCartVisible(false)} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
    </View>
  );
}

// ════════════════════════════════════════════════
// STYLES: MAIN CONTAINER
// ════════════════════════════════════════════════
const main = StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: CREAM,
    zIndex: 10,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 0, // Removed padding so hero reaches the top under transparent navbar
  },
  floatingCart: {
    position: 'absolute', bottom: 100, right: 30, zIndex: 100,
  },
  floatingCartBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#D32F2F', borderRadius: 10, minWidth: 20, height: 20,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
  },
  cartBadgeText: { color: WHITE, fontSize: 11, fontWeight: '800' },
});

// ════════════════════════════════════════════════
// STYLES: GRID VIEW
// ════════════════════════════════════════════════
const g = StyleSheet.create({
  splashHeroContainer: {
    width: '100%',
    height: Math.min(SH * 0.7, 850), // Cinematic height adjusted to fit text slightly better
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  splashImageWrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTextContent: {
    position: 'absolute',
    top: '40%', // pushed down to middle of upper white-space

    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  splashOverline: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 10,
    marginBottom: 16,
    textAlign: 'center',
  },
  splashTitle: {
    color: '#1a1a1a',
    fontSize: Platform.OS === 'web' && SW > 768 ? 54 : 36,
    fontWeight: '300',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 20,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  splashSubtitle: {
    color: '#444444',
    fontSize: 16,
    fontWeight: '300',
    lineHeight: 28,
    textAlign: 'center',
    maxWidth: 500,
  },

  hero: {
    width: '100%', alignItems: 'center',
    paddingVertical: 30, paddingHorizontal: 40,
  },
  heroInner: { alignItems: 'center' },
  heroGoldLine: {
    width: 60, height: 1.5, backgroundColor: GOLD,
    marginVertical: 14, borderRadius: 1,
  },
  heroLabel: {
    color: GOLD, fontSize: 14, fontWeight: '500',
    letterSpacing: 10, marginBottom: 10, textAlign: 'center',
  },
  heroTitle: {
    color: TEXT_PRIMARY, fontSize: 56, fontWeight: '300',
    letterSpacing: -1, marginBottom: 16, textAlign: 'center',
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  heroSubtitle: {
    color: TEXT_SECONDARY, fontSize: 16, fontWeight: '300',
    textAlign: 'center', lineHeight: 26, maxWidth: 460, marginBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 8, marginTop: 28,
  },
  categoryBtn: {
    paddingHorizontal: 22, paddingVertical: 10, borderRadius: 0,
    borderWidth: 1, borderColor: BORDER,
    ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.2s ease' } as any }),
  },
  categoryBtnActive: {
    backgroundColor: TEXT_PRIMARY, borderColor: TEXT_PRIMARY,
  },
  categoryBtnText: {
    color: TEXT_SECONDARY, fontSize: 11, fontWeight: '500', letterSpacing: 2,
  },
  categoryBtnTextActive: { color: WHITE },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 24, paddingHorizontal: 40, maxWidth: 1300,
    alignSelf: 'center', width: '100%', marginTop: 20,
  },
  card: {
    width: 290, backgroundColor: WHITE, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.3s ease' } as any }),
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3,
  },
  cardHovered: {
    ...Platform.select({ web: { boxShadow: '0 12px 40px rgba(0,0,0,0.08)' } as any }),
    borderColor: GOLD_BORDER,
  },
  cardImageArea: {
    height: 320, justifyContent: 'center', alignItems: 'center',
  },
  cardImage: { width: '55%', height: '80%' },
  cardInfo: {
    padding: 24, alignItems: 'center',
  },
  cardSubtitle: {
    color: TEXT_MUTED, fontSize: 10, fontWeight: '500',
    letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center',
  },
  cardName: {
    color: TEXT_PRIMARY, fontSize: 18, fontWeight: '600',
    letterSpacing: 3, marginBottom: 10, textAlign: 'center',
  },
  cardDesc: {
    color: TEXT_MUTED, fontSize: 12, lineHeight: 18,
    textAlign: 'center', marginBottom: 14, maxWidth: 240,
  },
  cardPrice: {
    color: TEXT_PRIMARY, fontSize: 16, fontWeight: '400',
    letterSpacing: 1,
  },

  emptyState: {
    width: '100%', alignItems: 'center', paddingVertical: 80,
  },
  emptyText: { color: TEXT_MUTED, fontSize: 16, marginBottom: 16 },
  resetText: { color: GOLD, fontSize: 14, fontWeight: '500', textDecorationLine: 'underline' },

  trustSection: {
    width: '100%', paddingVertical: 60, paddingHorizontal: 40,
    marginTop: 40, backgroundColor: CREAM_WARM,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: BORDER,
  },
  trustRow: {
    flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 40,
    maxWidth: 1000, alignSelf: 'center',
  },
  trustItem: { alignItems: 'center', width: 180 },
  trustItemTitle: {
    color: TEXT_PRIMARY, fontSize: 13, fontWeight: '500',
    letterSpacing: 1, marginTop: 12, textAlign: 'center',
  },
  trustItemSub: {
    color: TEXT_MUTED, fontSize: 11, marginTop: 4, textAlign: 'center',
  },

  footer: {
    alignItems: 'center', paddingVertical: 40, paddingHorizontal: 40,
  },
  footerLine: { width: 40, height: 1, backgroundColor: GOLD_BORDER, marginVertical: 14 },
  footerLogo: { height: 40, width: 100, marginBottom: 12, opacity: 0.8 },
  footerText: {
    color: TEXT_MUTED, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3,
  },
});

// ════════════════════════════════════════════════
// STYLES: PRODUCT DETAIL / LANDING PAGE
// ════════════════════════════════════════════════
const d = StyleSheet.create({
  // ── Hero ──
  heroSection: {
    paddingHorizontal: 40, maxWidth: 1100, alignSelf: 'center', width: '100%',
  },
  breadcrumb: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 30, marginTop: 10,
  },
  breadcrumbText: { color: TEXT_MUTED, fontSize: 13 },
  breadcrumbSep: { color: TEXT_LIGHT, fontSize: 13 },
  breadcrumbCurrent: { color: TEXT_PRIMARY, fontSize: 13, fontWeight: '500' },
  heroRow: {
    flexDirection: 'row', gap: 60, flexWrap: 'wrap', alignItems: 'flex-start',
  },
  heroImageCol: { flex: 1, minWidth: 300, maxWidth: 480 },
  heroImageBg: {
    width: '100%', aspectRatio: 0.85, justifyContent: 'center', alignItems: 'center',
  },
  heroImage: { width: '60%', height: '80%' },
  heroInfoCol: { flex: 1, minWidth: 300, paddingTop: 20 },
  heroSubtitle: {
    color: TEXT_MUTED, fontSize: 11, fontWeight: '500',
    letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8,
  },
  heroName: {
    color: TEXT_PRIMARY, fontSize: 36, fontWeight: '300',
    letterSpacing: 2, marginBottom: 16,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  heroTagline: {
    color: TEXT_SECONDARY, fontSize: 14, fontWeight: '400',
    letterSpacing: 1, marginBottom: 16,
  },
  heroDesc: {
    color: TEXT_SECONDARY, fontSize: 14, lineHeight: 22,
    fontWeight: '300', marginBottom: 24,
  },
  heroDivider: { width: '100%', height: 1, backgroundColor: BORDER, marginBottom: 24 },
  heroPriceRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: 40, marginBottom: 24,
  },
  heroSize: {
    color: TEXT_PRIMARY, fontSize: 16, fontWeight: '500', letterSpacing: 2,
  },
  heroPrice: {
    color: TEXT_PRIMARY, fontSize: 20, fontWeight: '400', letterSpacing: 1,
  },
  addToCartBtn: {
    borderWidth: 1, borderColor: TEXT_PRIMARY,
    paddingVertical: 16, paddingHorizontal: 48,
    alignItems: 'center', marginBottom: 24, alignSelf: 'flex-start',
    ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.2s ease' } as any }),
  },
  addToCartText: {
    color: TEXT_PRIMARY, fontSize: 13, fontWeight: '500', letterSpacing: 3,
  },
  trustBadges: { gap: 10 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trustBadgeText: { color: TEXT_MUTED, fontSize: 13 },

  // ── Stats ──
  statsSection: {
    paddingVertical: 60, paddingHorizontal: 40,
    maxWidth: 1100, alignSelf: 'center', width: '100%',
    borderTopWidth: 1, borderColor: BORDER, marginTop: 40,
  },
  statsHeading: {
    color: TEXT_PRIMARY, fontSize: 36, fontWeight: '300',
    lineHeight: 46, marginBottom: 40,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  statsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 40, justifyContent: 'flex-start',
  },
  statItem: { minWidth: 180 },
  statValue: {
    fontSize: 48, fontWeight: '300', marginBottom: 8,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  statLabel: {
    color: TEXT_MUTED, fontSize: 11, fontWeight: '500', letterSpacing: 2,
  },

  // ── Story ──
  storySection: {
    flexDirection: 'row', flexWrap: 'wrap', marginTop: 20,
  },
  storyImageCol: {
    flex: 1, minWidth: 300, minHeight: 400,
    justifyContent: 'center', alignItems: 'center',
  },
  storyImage: { width: '45%', height: '70%' },
  storyTextCol: {
    flex: 1, minWidth: 300, padding: 60, justifyContent: 'center',
    backgroundColor: WHITE,
  },
  storyTitle: {
    color: TEXT_PRIMARY, fontSize: 30, fontWeight: '300',
    marginBottom: 20, lineHeight: 40,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  storyText: {
    color: TEXT_SECONDARY, fontSize: 15, lineHeight: 26, fontWeight: '300',
    marginBottom: 16,
  },
  storyDesc: {
    color: TEXT_MUTED, fontSize: 13, lineHeight: 22, fontWeight: '300',
  },

  // ── Benefits ──
  benefitsSection: {
    paddingVertical: 60, paddingHorizontal: 40,
    maxWidth: 1100, alignSelf: 'center', width: '100%',
  },
  sectionHeading: {
    color: TEXT_PRIMARY, fontSize: 32, fontWeight: '300',
    lineHeight: 42, marginBottom: 36,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 40 },
  benefitsListCol: { flex: 1, minWidth: 300 },
  benefitItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderColor: BORDER,
  },
  benefitNumber: {
    color: GOLD, fontSize: 14, fontWeight: '400', letterSpacing: 1, marginTop: 2,
  },
  benefitText: {
    color: TEXT_SECONDARY, fontSize: 16, fontWeight: '300', lineHeight: 24, flex: 1,
  },

  // ── Ingredients ──
  ingredientsSection: {
    paddingVertical: 60, paddingHorizontal: 40,
    maxWidth: 1100, alignSelf: 'center', width: '100%',
    borderTopWidth: 1, borderColor: BORDER,
  },
  ingredientCardsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 30, marginBottom: 40,
  },
  ingredientCard: {
    flex: 1, minWidth: 220, alignItems: 'center',
  },
  ingredientCircle: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, marginBottom: 16,
  },
  ingredientName: {
    color: TEXT_PRIMARY, fontSize: 16, fontWeight: '500',
    marginBottom: 8, textAlign: 'center',
  },
  ingredientDesc: {
    color: TEXT_SECONDARY, fontSize: 13, lineHeight: 20,
    textAlign: 'center', maxWidth: 240, fontWeight: '300',
  },
  allIngredientsBox: {
    padding: 24, borderWidth: 1, borderColor: BORDER,
    backgroundColor: CREAM_SOFT,
  },
  allIngredientsTitle: {
    color: TEXT_PRIMARY, fontSize: 13, fontWeight: '600',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10,
  },
  allIngredientsList: {
    color: TEXT_SECONDARY, fontSize: 13, lineHeight: 22, fontWeight: '300',
  },

  // ── Usage ──
  usageSection: {
    paddingVertical: 50, paddingHorizontal: 40,
    maxWidth: 1100, alignSelf: 'center', width: '100%',
    borderTopWidth: 1, borderColor: BORDER,
  },
  usageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 40 },
  usageCol: { flex: 1, minWidth: 260 },
  usageColTitle: {
    color: TEXT_PRIMARY, fontSize: 18, fontWeight: '400',
    marginBottom: 14, letterSpacing: 1,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  usageSmallLabel: {
    color: TEXT_MUTED, fontSize: 11, fontWeight: '500', letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: 6,
  },
  usageText: {
    color: TEXT_SECONDARY, fontSize: 14, lineHeight: 22, fontWeight: '300',
  },
  usageDividerV: {
    width: 1, backgroundColor: BORDER, alignSelf: 'stretch',
  },
  usageWhenRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  usageWhenText: { color: TEXT_SECONDARY, fontSize: 14, fontWeight: '300' },

  // ── Ideal For ──
  idealSection: {
    paddingVertical: 60, paddingHorizontal: 40,
    maxWidth: 1100, alignSelf: 'center', width: '100%',
    borderTopWidth: 1, borderColor: BORDER,
  },
  idealTitle: {
    color: TEXT_PRIMARY, fontSize: 30, fontWeight: '300',
    marginBottom: 16,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  idealText: {
    color: TEXT_SECONDARY, fontSize: 16, fontWeight: '300',
    lineHeight: 26, marginBottom: 28,
  },
  claimsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  claimBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: BORDER,
  },
  claimText: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '400' },

  // ── Reviews ──
  reviewsSection: {
    paddingVertical: 60, alignItems: 'center',
    backgroundColor: CREAM_WARM, borderTopWidth: 1, borderColor: BORDER,
  },
  reviewsHeading: {
    color: TEXT_PRIMARY, fontSize: 28, fontWeight: '300',
    textAlign: 'center',
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  reviewsSubheading: {
    color: TEXT_MUTED, fontSize: 13, letterSpacing: 2,
    textTransform: 'uppercase', marginTop: 6, marginBottom: 16,
  },
  reviewsStarsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 36,
  },
  reviewsRating: { color: TEXT_MUTED, fontSize: 14, marginLeft: 10 },
  reviewsList: {
    width: '100%', maxWidth: 900, paddingHorizontal: 40, gap: 20,
  },
  reviewCard: {
    padding: 28, backgroundColor: WHITE,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  reviewStarsSmall: { flexDirection: 'row', gap: 2, marginBottom: 12 },
  reviewText: {
    color: TEXT_SECONDARY, fontSize: 15, lineHeight: 24,
    fontStyle: 'italic', fontWeight: '300', marginBottom: 10,
  },
  reviewAuthor: {
    color: TEXT_MUTED, fontSize: 12, fontWeight: '500', letterSpacing: 1,
  },

  // ── Discover More ──
  discoverSection: {
    paddingVertical: 60, paddingHorizontal: 40, alignItems: 'center',
  },
  discoverHeading: {
    color: TEXT_PRIMARY, fontSize: 28, fontWeight: '300',
    marginBottom: 36, textAlign: 'center',
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  discoverGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 30,
  },
  discoverCard: {
    width: 240, alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  discoverImageBg: {
    width: '100%', height: 260, justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  discoverImage: { width: '50%', height: '75%' },
  discoverName: {
    color: TEXT_PRIMARY, fontSize: 14, fontWeight: '600',
    letterSpacing: 2, marginBottom: 6, textAlign: 'center',
  },
  discoverSub: {
    color: TEXT_MUTED, fontSize: 11, lineHeight: 16,
    textAlign: 'center', marginBottom: 8, maxWidth: 200,
  },
  discoverPrice: {
    color: TEXT_PRIMARY, fontSize: 14, fontWeight: '400',
  },

  // ── Footer Trust ──
  footerSection: {
    backgroundColor: CREAM_WARM, paddingVertical: 40, paddingHorizontal: 40,
    borderTopWidth: 1, borderColor: BORDER,
  },
  footerTrustRow: {
    flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 40,
    maxWidth: 900, alignSelf: 'center',
  },
  footerTrustItem: { alignItems: 'center', width: 140 },
  footerTrustText: {
    color: TEXT_MUTED, fontSize: 11, textAlign: 'center',
    marginTop: 10, lineHeight: 16, letterSpacing: 0.5,
  },
});

// ════════════════════════════════════════════════
// STYLES: STICKY BOTTOM BAR
// ════════════════════════════════════════════════
const sb = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: WHITE, borderTopWidth: 1, borderColor: BORDER,
    paddingVertical: 12, paddingHorizontal: 30, zIndex: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 5,
  },
  inner: {
    flexDirection: 'row', alignItems: 'center', maxWidth: 1100,
    alignSelf: 'center', width: '100%', gap: 20,
  },
  image: { width: 44, height: 44 },
  info: { flex: 1 },
  name: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: '500' },
  sub: { color: TEXT_MUTED, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  size: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: '500', letterSpacing: 1 },
  price: { color: TEXT_PRIMARY, fontSize: 16, fontWeight: '400', letterSpacing: 0.5 },
  cartBtn: {
    borderWidth: 1, borderColor: TEXT_PRIMARY,
    paddingVertical: 12, paddingHorizontal: 28,
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  cartBtnText: {
    color: TEXT_PRIMARY, fontSize: 12, fontWeight: '500', letterSpacing: 2,
  },
});

// ════════════════════════════════════════════════
// STYLES: CART DRAWER
// ════════════════════════════════════════════════
const cart = StyleSheet.create({
  drawer: {
    position: 'absolute', top: 0, right: 0, bottom: 0,
    width: Math.min(380, SW * 0.85),
    backgroundColor: WHITE, borderLeftWidth: 1, borderColor: BORDER, zIndex: 300,
    shadowColor: '#000', shadowOffset: { width: -8, height: 0 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 10,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, paddingTop: Platform.OS === 'web' ? 120 : 140,
    borderBottomWidth: 1, borderColor: BORDER,
  },
  headerTitle: {
    color: TEXT_PRIMARY, fontSize: 18, fontWeight: '400', letterSpacing: 2,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  list: { flex: 1, padding: 24 },
  emptyText: { color: TEXT_MUTED, fontSize: 14, textAlign: 'center', marginTop: 40 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderColor: BORDER,
  },
  itemImg: { width: 56, height: 56 },
  itemInfo: { flex: 1 },
  itemName: { color: TEXT_PRIMARY, fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  itemSize: { color: TEXT_MUTED, fontSize: 11, marginTop: 2 },
  itemPrice: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: '400', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 0,
    borderWidth: 1, borderColor: BORDER, justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  qtyBtnText: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: '400' },
  qtyText: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: '500', minWidth: 18, textAlign: 'center' },
  footer: {
    padding: 24, borderTopWidth: 1, borderColor: BORDER,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { color: TEXT_MUTED, fontSize: 12, fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase' },
  totalValue: { color: TEXT_PRIMARY, fontSize: 20, fontWeight: '400' },
  checkoutBtn: {
    backgroundColor: TEXT_PRIMARY, paddingVertical: 16, alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  checkoutText: { color: WHITE, fontSize: 12, fontWeight: '500', letterSpacing: 3 },
});
