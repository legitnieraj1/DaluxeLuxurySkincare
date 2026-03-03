import React, { useState, useEffect, useCallback } from 'react';
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
  Moon,
  Sun,
  Leaf,
  Droplets,
  Shield,
} from 'lucide-react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ════════════════════════════════════════════════
// THEME CONSTANTS
// ════════════════════════════════════════════════
const GOLD = '#C9A84C';
const GOLD_DIM = 'rgba(201,168,76,0.4)';
const GOLD_GLOW = 'rgba(201,168,76,0.15)';
const BG = '#0a0a0a';
const CARD_BG = 'rgba(255,255,255,0.04)';
const CARD_BORDER = 'rgba(255,255,255,0.08)';
const WHITE = '#ffffff';
const WHITE_80 = 'rgba(255,255,255,0.8)';
const WHITE_60 = 'rgba(255,255,255,0.6)';
const WHITE_40 = 'rgba(255,255,255,0.4)';
const WHITE_20 = 'rgba(255,255,255,0.2)';
const SERIF = Platform.select({
  web: 'Georgia, "Playfair Display", "Times New Roman", serif',
  default: undefined,
});

// ════════════════════════════════════════════════
// PRODUCT DATA — ALL 4 PRODUCTS
// ════════════════════════════════════════════════
const COLLECTION_PRODUCTS = [
  {
    id: 'facewash',
    name: 'ULTRA SENSITIVE GOLD GLOW FACEWASH',
    shortName: 'FACEWASH',
    subtitle: 'Ultra Sensitive Gold Glow',
    category: 'cleanse',
    tagline: 'Gentle Luxury Cleanse with Gold Glow & Herbal Care',
    price: 249,
    priceDisplay: '\u20B9249',
    size: '100 ml (3.38 fl oz)',
    rating: 4.8,
    image: require('./assets/facewash.jpeg'),
    themeColor: '#4A7C59',
    themeGradient: ['rgba(74,124,89,0.25)', 'rgba(74,124,89,0)'] as [string, string],
    highlights: [
      { icon: 'leaf', label: 'Crystal clear gel with real gold flakes' },
      { icon: 'droplets', label: 'Ultra gentle sulphate-free cleansing' },
      { icon: 'sparkles', label: 'Herbal glow boosting formula' },
    ],
    benefits: [
      'Deep yet gentle cleansing',
      'Instant freshness & soft glow',
      'Helps reduce redness & irritation feel',
      'Hydrates and soothes skin',
      'Promotes radiant, healthy complexion',
    ],
    concerns: ['Dullness', 'Mild Redness', 'Sensitivity', 'Dehydrated Skin', 'Uneven Texture'],
    description:
      'A luxurious crystal clear gel facewash infused with herbal extracts, hydrosols and real gold flakes that gently cleanses impurities while soothing sensitive skin and enhancing natural glow.',
    ingredients: [
      'Rose Hydrosol', 'Saffron Extract', 'Licorice Extract', 'Manjistha', 'Amla',
      'Gotu Kola', 'Chamomile', 'Sandalwood', 'Lotus', 'Neem', 'Tulsi',
      'Organic Honey', 'Vitamin E', 'Kumkumadi Taila', 'Gold Nano Dust', '24K Gold Leaf',
    ],
    texture: 'Lightweight crystal clear gel with visible gold flakes',
    fragrance: 'Soft floral luxury fragrance with rose & saffron notes',
    howToUse: 'Take small amount on wet face, gently massage in circular motion and rinse with water. Pat dry.',
    whenToUse: 'Morning & Night (twice daily)',
    suitableFor: ['All Skin Types', 'Sensitive Skin'],
    claims: ['Sulphate Free', 'Paraben Free', 'Soap Free', 'Gentle Surfactants', 'pH Balanced', 'Dermatologically Inspired'],
    shelfLife: '24 Months from manufacturing date',
    storage: 'Store in cool & dry place. Keep away from direct sunlight.',
    safety: 'For external use only. Avoid contact with eyes. Patch test recommended before use.',
    reviews: [
      { text: 'Luxury glow experience. Very gentle and leaves my skin soft with a natural glow.', author: 'Verified Buyer' },
      { text: 'Perfect for sensitive skin, cleans well without any dryness.', author: 'Verified Buyer' },
      { text: 'Light gel formula that hydrates and gives a fresh radiant look.', author: 'Verified Buyer' },
    ],
  },
  {
    id: 'hairserum',
    name: 'ULTRA SENSITIVE SMOOTH & SHINE HAIR SERUM',
    shortName: 'HAIR SERUM',
    subtitle: 'Ultra Sensitive Smooth',
    category: 'hair',
    tagline: 'Weightless Smoothness \u00B7 Natural Shine \u00B7 Zero Silicone Feel',
    price: 349,
    priceDisplay: '\u20B9349',
    size: '30 ml (1.0 fl oz)',
    rating: 4.8,
    image: require('./assets/hair serum.png'),
    themeColor: '#108cba',
    themeGradient: ['rgba(16,140,186,0.25)', 'rgba(16,140,186,0)'] as [string, string],
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
    description:
      'A lightweight leave-in hair serum formulated with botanical oils and Ayurvedic extracts to smooth frizz, enhance shine and nourish scalp gently without greasy residue.',
    ingredients: [
      'Coconut MCT Oil', 'Jojoba Oil', 'Argan Oil', 'Sweet Almond Oil', 'Bhringraj Oil',
      'Hibiscus Extract', 'Licorice Extract', 'Fenugreek Extract', 'Olive Squalane', 'Vitamin E',
    ],
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
      { text: 'Smooth and shiny finish without any heaviness at all.', author: 'Verified Buyer' },
      { text: 'Lightweight and non-greasy, perfect for daily use.', author: 'Verified Buyer' },
      { text: 'Perfect for sensitive scalp care and frizz control.', author: 'Verified Buyer' },
    ],
  },
  {
    id: 'faceserum',
    name: 'ULTRA SENSITIVE GLOW & CORRECT FACE SERUM',
    shortName: 'FACE SERUM',
    subtitle: 'Ultra Sensitive Glow & Correct',
    category: 'serum',
    tagline: 'Gentle Brightening \u00B7 No Irritation \u00B7 Daily Glow Boost',
    price: 449,
    priceDisplay: '\u20B9449',
    size: '30 ml (1.0 fl oz)',
    rating: 4.8,
    image: require('./assets/faceserum.png'),
    themeColor: '#1BA8A0',
    themeGradient: ['rgba(27,168,160,0.25)', 'rgba(27,168,160,0)'] as [string, string],
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
    description:
      'A gentle face serum formulated with hydrosols, botanical extracts and mild actives to brighten skin, reduce pigmentation and provide soothing hydration without irritation.',
    ingredients: [
      'Aloe Vera', 'Rose Hydrosol', 'Licorice Extract', 'Alpha Arbutin', 'Gotu Kola',
      'Vitamin C', 'Panthenol', 'Sodium Hyaluronate', 'Chamomile', 'Bakuchiol',
    ],
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
      { text: 'Lightweight and soothing serum, perfect for daily use.', author: 'Verified Buyer' },
      { text: 'Gentle glow without any irritation at all.', author: 'Verified Buyer' },
      { text: 'Hydrating and non-sticky feel, absolutely love it!', author: 'Verified Buyer' },
    ],
  },
  {
    id: 'nightcream',
    name: 'ULTRA SENSITIVE REPAIR NIGHT CREAM',
    shortName: 'NIGHT CREAM',
    subtitle: 'Ultra Sensitive Repair',
    category: 'night',
    tagline: 'Low Irritation \u00B7 Acne Safe \u00B7 Overnight Skin Repair',
    price: 399,
    priceDisplay: '\u20B9399',
    size: '30g / 1.0 fl oz',
    rating: 4.8,
    image: require('./assets/nightcream.png'),
    themeColor: '#8B2252',
    themeGradient: ['rgba(139,34,82,0.25)', 'rgba(139,34,82,0)'] as [string, string],
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
    description:
      'A gentle night cream formulated with hydrosols, botanical extracts and vitamins to calm, hydrate and repair skin overnight, leaving it soft, smooth and radiant.',
    ingredients: [
      'Rose Hydrosol', 'Aloe Vera', 'Squalane', 'Jojoba Oil', 'Licorice Extract',
      'Gotu Kola', 'Niacinamide', 'Chamomile', 'Panthenol', 'Vitamin E',
    ],
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
      { text: 'Gentle and soothing for sensitive skin, remarkable results.', author: 'Verified Buyer' },
      { text: 'Deep hydration with soft glow, wake up feeling refreshed.', author: 'Verified Buyer' },
      { text: 'Lightweight and non-greasy formula, absorbs quickly.', author: 'Verified Buyer' },
    ],
  },
];

type ProductType = typeof COLLECTION_PRODUCTS[0];
type CartItem = { product: ProductType; quantity: number };

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'cleanse', label: 'Cleanse' },
  { id: 'serum', label: 'Serums' },
  { id: 'hair', label: 'Hair Care' },
  { id: 'night', label: 'Night Care' },
];

const CONCERNS = ['All', 'Dullness', 'Sensitivity', 'Dryness', 'Acne', 'Pigmentation', 'Frizz'];

// ════════════════════════════════════════════════
// HELPER COMPONENTS
// ════════════════════════════════════════════════

/** Animated floating orb for hero decoration */
const FloatingOrb = ({ delay = 0, size, color, top, left, right, duration = 3000 }: any) => {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-18, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left,
          right,
          opacity: 0.35,
          ...Platform.select({ web: { filter: `blur(${Math.round(size * 0.5)}px)` } as any }),
        },
        animStyle,
      ]}
    />
  );
};

/** Hover-aware card wrapper with scale animation */
const HoverCard = ({ children, style, onPress }: any) => {
  const [hovered, setHovered] = useState(false);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Pressable
      onHoverIn={() => {
        setHovered(true);
        scale.value = withTiming(1.03, { duration: 300 });
      }}
      onHoverOut={() => {
        setHovered(false);
        scale.value = withTiming(1, { duration: 300 });
      }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          style,
          animStyle,
          hovered && {
            borderColor: GOLD_DIM,
            ...Platform.select({
              web: { boxShadow: '0 25px 60px rgba(201,168,76,0.18)' } as any,
            }),
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

/** Render icon by type string */
const IconForType = ({ type, color, size = 18 }: { type: string; color: string; size?: number }) => {
  switch (type) {
    case 'leaf':
      return <Leaf color={color} size={size} />;
    case 'droplets':
      return <Droplets color={color} size={size} />;
    case 'shield':
      return <Shield color={color} size={size} />;
    default:
      return <Sparkles color={color} size={size} />;
  }
};

// ════════════════════════════════════════════════
// PRODUCT DETAIL OVERLAY
// ════════════════════════════════════════════════
const ProductDetail = ({
  product,
  onClose,
  onAddToCart,
}: {
  product: ProductType;
  onClose: () => void;
  onAddToCart: (p: ProductType) => void;
}) => {
  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={dS.overlay}>
      {/* Fixed Close Button */}
      <TouchableOpacity style={dS.closeBtn} onPress={onClose} activeOpacity={0.7}>
        <X color={WHITE} size={24} />
      </TouchableOpacity>

      <ScrollView
        style={dS.scroll}
        contentContainerStyle={dS.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 1: Product Spotlight ── */}
        <View style={dS.spotlightSection}>
          <View style={dS.spotlightLeft}>
            <View style={[dS.imageGlow, { backgroundColor: product.themeColor }]} />
            <Image source={product.image} style={dS.spotlightImage} resizeMode="contain" />
          </View>
          <View style={dS.spotlightRight}>
            <Text style={dS.spotlightCategory}>{product.subtitle}</Text>
            <Text style={dS.spotlightName}>{product.shortName}</Text>
            <Text style={dS.spotlightTagline}>{product.tagline}</Text>
            <View style={dS.ratingRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  color={GOLD}
                  size={16}
                  fill={i <= Math.floor(product.rating) ? GOLD : 'transparent'}
                />
              ))}
              <Text style={dS.ratingText}>{product.rating} / 5</Text>
            </View>
            <Text style={dS.spotlightSize}>{product.size}</Text>
            <Text style={dS.spotlightPrice}>{product.priceDisplay}</Text>
            <View style={dS.actionRow}>
              <TouchableOpacity
                style={[dS.addToCartBtn, { backgroundColor: product.themeColor }]}
                onPress={() => onAddToCart(product)}
                activeOpacity={0.8}
              >
                <ShoppingCart color={WHITE} size={18} />
                <Text style={dS.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={dS.wishlistBtn} activeOpacity={0.7}>
                <Heart color={WHITE_60} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={dS.sectionDivider} />

        {/* ── Section 2: Luxury Highlight Icons ── */}
        <View style={dS.section}>
          <View style={dS.highlightGrid}>
            {product.highlights.map((h, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 100).duration(400)}
                style={dS.highlightCard}
              >
                <View style={[dS.highlightIconBg, { backgroundColor: product.themeColor + '20' }]}>
                  <IconForType type={h.icon} color={product.themeColor} size={22} />
                </View>
                <Text style={dS.highlightLabel}>{h.label}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ── Section 3: Key Benefits ── */}
        <View style={dS.section}>
          <Text style={dS.sectionTitle}>What It Does</Text>
          <View style={dS.benefitsList}>
            {product.benefits.map((b, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 80).duration(300)}
                style={dS.benefitItem}
              >
                <View style={[dS.benefitDot, { backgroundColor: product.themeColor }]} />
                <Text style={dS.benefitText}>{b}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={dS.sectionDivider} />

        {/* ── Section 4: Skin Concern Tags ── */}
        <View style={dS.section}>
          <Text style={dS.sectionTitle}>Targets</Text>
          <View style={dS.tagGrid}>
            {product.concerns.map((c, i) => (
              <Animated.View
                key={i}
                entering={FadeIn.delay(i * 60).duration(300)}
                style={[dS.tag, { borderColor: product.themeColor + '50' }]}
              >
                <Text style={[dS.tagText, { color: product.themeColor }]}>{c}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={dS.sectionDivider} />

        {/* ── Section 5: Ingredients ── */}
        <View style={dS.section}>
          <Text style={dS.sectionTitle}>Powered by Botanical Science</Text>
          <Text style={dS.sectionDesc}>{product.description}</Text>
          <View style={dS.ingredientGrid}>
            {product.ingredients.map((ing, i) => (
              <Animated.View
                key={i}
                entering={FadeIn.delay(i * 40).duration(300)}
                style={dS.ingredientChip}
              >
                <Sparkles color={GOLD} size={11} />
                <Text style={dS.ingredientText}>{ing}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={dS.sectionDivider} />

        {/* ── Section 6: Texture & Sensory ── */}
        <View style={dS.section}>
          <Text style={dS.sectionTitle}>Texture & Feel</Text>
          <Text style={dS.textureText}>{product.texture}</Text>
          <Text style={dS.fragranceLabel}>Fragrance</Text>
          <Text style={dS.fragranceText}>{product.fragrance}</Text>
        </View>

        <View style={dS.sectionDivider} />

        {/* ── Section 7: Usage ── */}
        <View style={dS.section}>
          <View style={dS.usageGrid}>
            <View style={dS.usageCol}>
              <Text style={dS.usageTitle}>How to Use</Text>
              <Text style={dS.usageText}>{product.howToUse}</Text>
            </View>
            <View style={dS.usageCol}>
              <Text style={dS.usageTitle}>When to Use</Text>
              <View style={dS.usageIconRow}>
                {product.whenToUse.toLowerCase().includes('night') && (
                  <Moon color={product.themeColor} size={20} />
                )}
                {(product.whenToUse.toLowerCase().includes('morning') ||
                  product.whenToUse.toLowerCase().includes('am')) && (
                  <Sun color={product.themeColor} size={20} />
                )}
                {product.whenToUse.toLowerCase().includes('daily') && (
                  <Sparkles color={product.themeColor} size={20} />
                )}
              </View>
              <Text style={dS.usageText}>{product.whenToUse}</Text>
            </View>
          </View>
        </View>

        <View style={dS.sectionDivider} />

        {/* ── Section 8: Suitable For ── */}
        <View style={dS.section}>
          <Text style={dS.sectionTitle}>Suitable For</Text>
          <View style={dS.suitableGrid}>
            {product.suitableFor.map((s, i) => (
              <View key={i} style={dS.suitableBadge}>
                <Check color={GOLD} size={14} />
                <Text style={dS.suitableText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={dS.sectionDivider} />

        {/* ── Section 9: Clinical & Safety ── */}
        <View style={dS.section}>
          <Text style={dS.sectionTitle}>Clinical Claims</Text>
          <View style={dS.claimsGrid}>
            {product.claims.map((c, i) => (
              <View key={i} style={dS.claimItem}>
                <Check color="#4CAF50" size={16} />
                <Text style={dS.claimText}>{c}</Text>
              </View>
            ))}
          </View>
          <View style={dS.safetyBlock}>
            <Text style={dS.safetyLabel}>
              Shelf Life: <Text style={dS.safetyValue}>{product.shelfLife}</Text>
            </Text>
            <Text style={dS.safetyLabel}>
              Storage: <Text style={dS.safetyValue}>{product.storage}</Text>
            </Text>
            <Text style={dS.safetyLabel}>
              Safety: <Text style={dS.safetyValue}>{product.safety}</Text>
            </Text>
          </View>
        </View>

        <View style={dS.sectionDivider} />

        {/* ── Section 10: Brand Trust ── */}
        <View style={dS.brandSection}>
          <View style={dS.goldLine} />
          <Text style={dS.brandName}>D A LUXE</Text>
          <Text style={dS.brandSub}>Marketed by D A LUXE, India</Text>
          <Text style={dS.brandSub}>ISO & GMP Certified \u00B7 Made in India</Text>
          <View style={dS.goldLine} />
        </View>

        {/* ── Section 11: Reviews ── */}
        <View style={dS.section}>
          <View style={dS.reviewHeader}>
            <Text style={dS.sectionTitle}>Reviews</Text>
            <View style={dS.ratingBig}>
              <Star color={GOLD} size={24} fill={GOLD} />
              <Text style={dS.ratingBigText}>{product.rating}</Text>
              <Text style={dS.ratingBigSub}>/ 5 Average</Text>
            </View>
          </View>
          <View style={dS.reviewGrid}>
            {product.reviews.map((r, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 100).duration(400)}
                style={dS.reviewCard}
              >
                <View style={dS.reviewStars}>
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Star key={j} color={GOLD} size={12} fill={GOLD} />
                  ))}
                </View>
                <Text style={dS.reviewText}>&ldquo;{r.text}&rdquo;</Text>
                <View style={dS.reviewAuthor}>
                  <Check color="#4CAF50" size={12} />
                  <Text style={dS.authorText}>{r.author}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </Animated.View>
  );
};

// ════════════════════════════════════════════════
// CART DRAWER
// ════════════════════════════════════════════════
const CartDrawer = ({
  items,
  visible,
  onClose,
  onUpdateQuantity,
  onRemove,
}: {
  items: CartItem[];
  visible: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) => {
  if (!visible) return null;
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <Animated.View entering={SlideInRight.duration(300)} exiting={SlideOutRight.duration(200)} style={cS.drawer}>
      <View style={cS.header}>
        <Text style={cS.headerTitle}>Your Cart</Text>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <X color={WHITE} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView style={cS.itemsList} showsVerticalScrollIndicator={false}>
        {items.length === 0 && <Text style={cS.emptyText}>Your cart is empty</Text>}
        {items.map((item) => (
          <View key={item.product.id} style={cS.cartItem}>
            <Image source={item.product.image} style={cS.cartImage} resizeMode="contain" />
            <View style={cS.cartItemInfo}>
              <Text style={cS.cartItemName}>{item.product.shortName}</Text>
              <Text style={cS.cartItemSize}>{item.product.size}</Text>
              <Text style={cS.cartItemPrice}>{item.product.priceDisplay}</Text>
            </View>
            <View style={cS.cartQty}>
              <TouchableOpacity
                style={cS.qtyBtn}
                onPress={() =>
                  item.quantity > 1
                    ? onUpdateQuantity(item.product.id, item.quantity - 1)
                    : onRemove(item.product.id)
                }
                activeOpacity={0.7}
              >
                <Text style={cS.qtyBtnText}>{'\u2212'}</Text>
              </TouchableOpacity>
              <Text style={cS.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={cS.qtyBtn}
                onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                activeOpacity={0.7}
              >
                <Text style={cS.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {items.length > 0 && (
        <View style={cS.footer}>
          <View style={cS.totalRow}>
            <Text style={cS.totalLabel}>Total</Text>
            <Text style={cS.totalValue}>{'\u20B9'}{total.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={cS.checkoutBtn} activeOpacity={0.8}>
            <Text style={cS.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

// ════════════════════════════════════════════════
// MAIN COLLECTION PAGE COMPONENT
// ════════════════════════════════════════════════
interface CollectionPageProps {
  onNavigateToProduct?: (index: number) => void;
}

export default function CollectionPage({ onNavigateToProduct }: CollectionPageProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeConcern, setActiveConcern] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartVisible, setCartVisible] = useState(false);

  // Filter products
  const filteredProducts = COLLECTION_PRODUCTS.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (
      activeConcern !== 'All' &&
      !p.concerns.some((c) => c.toLowerCase().includes(activeConcern.toLowerCase()))
    )
      return false;
    return true;
  });

  const addToCart = useCallback((product: ProductType) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
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
    <View style={s.container}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ════ HERO SECTION ════ */}
        <View style={s.hero}>
          {/* Decorative floating orbs */}
          <FloatingOrb delay={0} size={220} color={GOLD} top={30} left={-80} duration={4000} />
          <FloatingOrb
            delay={600}
            size={160}
            color="rgba(139,34,82,0.5)"
            top={10}
            right={-50}
            duration={3500}
          />
          <FloatingOrb
            delay={1200}
            size={130}
            color="rgba(27,168,160,0.4)"
            top={110}
            right={120}
            duration={3200}
          />
          <FloatingOrb
            delay={300}
            size={100}
            color="rgba(16,140,186,0.35)"
            top={160}
            left={100}
            duration={3800}
          />

          <Animated.View entering={FadeInDown.duration(600)} style={s.heroInner}>
            <View style={s.heroGoldLine} />
            <Text style={s.heroLabel}>D A L U X E {'  '} S K I N C A R E</Text>
            <Text style={s.heroTitle}>The Collection</Text>
            <Text style={s.heroSubtitle}>
              Dermal-Grade Botanical Formulas.{'\n'}Designed for Sensitive Perfection.
            </Text>
            <View style={s.heroGoldLine} />
          </Animated.View>

          {/* Category Selector Buttons */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={s.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[s.categoryBtn, activeCategory === cat.id && s.categoryBtnActive]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.categoryBtnText,
                    activeCategory === cat.id && s.categoryBtnTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        {/* ════ FILTER BAR ════ */}
        <View style={s.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterScroll}
          >
            <Text style={s.filterLabel}>Concern:</Text>
            {CONCERNS.map((concern) => (
              <TouchableOpacity
                key={concern}
                style={[s.filterPill, activeConcern === concern && s.filterPillActive]}
                onPress={() => setActiveConcern(concern)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.filterPillText,
                    activeConcern === concern && s.filterPillTextActive,
                  ]}
                >
                  {concern}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ════ PRODUCT GRID ════ */}
        <View style={s.productGrid}>
          {filteredProducts.map((product, index) => (
            <HoverCard
              key={product.id}
              style={s.productCard}
              onPress={() => setSelectedProduct(product)}
            >
              {/* Accent glow behind card */}
              <View style={[s.cardGlow, { backgroundColor: product.themeColor }]} />

              {/* Product Image Area */}
              <LinearGradient colors={product.themeGradient} style={s.cardImageArea}>
                <Image source={product.image} style={s.cardImage} resizeMode="contain" />
              </LinearGradient>

              {/* Card Content */}
              <View style={s.cardContent}>
                <Text style={[s.cardSubtitle, { color: product.themeColor }]}>
                  {product.subtitle}
                </Text>
                <Text style={s.cardName}>{product.shortName}</Text>
                <View style={s.cardDivider} />

                {/* Highlight Icons */}
                <View style={s.cardHighlights}>
                  {product.highlights.map((h, i) => (
                    <View key={i} style={s.cardHighlightRow}>
                      <IconForType type={h.icon} color={product.themeColor} size={13} />
                      <Text style={s.cardHighlightText} numberOfLines={1}>
                        {h.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Price & CTA */}
                <View style={s.cardFooter}>
                  <Text style={s.cardPrice}>{product.priceDisplay}</Text>
                  <View style={[s.exploreBtn, { backgroundColor: product.themeColor }]}>
                    <Text style={s.exploreBtnText}>Explore</Text>
                    <ChevronRight color={WHITE} size={14} />
                  </View>
                </View>
              </View>
            </HoverCard>
          ))}

          {/* Empty state */}
          {filteredProducts.length === 0 && (
            <View style={s.emptyState}>
              <Sparkles color={GOLD} size={32} style={{ opacity: 0.4, marginBottom: 16 }} />
              <Text style={s.emptyText}>No products match your filters.</Text>
              <TouchableOpacity
                onPress={() => {
                  setActiveCategory('all');
                  setActiveConcern('All');
                }}
                activeOpacity={0.7}
              >
                <Text style={s.resetText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ════ BRAND TRUST FOOTER ════ */}
        <View style={s.trustSection}>
          <View style={s.trustLine} />
          <Image
            source={require('./assets/logo.png')}
            style={s.trustLogo}
            resizeMode="contain"
          />
          <Text style={s.trustText}>Dermal-Grade Botanical Formula</Text>
          <Text style={s.trustText}>ISO & GMP Certified {'\u00B7'} Made in India</Text>
          <View style={s.trustLine} />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ════ FLOATING CART BUTTON ════ */}
      {cartCount > 0 && !cartVisible && !selectedProduct && (
        <Animated.View entering={FadeIn.duration(300)} style={s.floatingCart}>
          <TouchableOpacity
            style={s.floatingCartBtn}
            onPress={() => setCartVisible(true)}
            activeOpacity={0.8}
          >
            <ShoppingCart color={WHITE} size={20} />
            <View style={s.cartBadge}>
              <Text style={s.cartBadgeText}>{cartCount}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ════ PRODUCT DETAIL OVERLAY ════ */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* ════ CART DRAWER ════ */}
      <CartDrawer
        items={cartItems}
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </View>
  );
}

// ════════════════════════════════════════════════
// MAIN PAGE STYLES
// ════════════════════════════════════════════════
const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BG,
    zIndex: 10,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: Platform.OS === 'web' ? 120 : 140,
    alignItems: 'center',
  },

  // ── Hero ──
  hero: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  heroInner: {
    alignItems: 'center',
  },
  heroGoldLine: {
    width: 80,
    height: 2,
    backgroundColor: GOLD,
    marginVertical: 16,
    borderRadius: 1,
  },
  heroLabel: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroTitle: {
    color: WHITE,
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
    marginBottom: 16,
    textAlign: 'center',
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  heroSubtitle: {
    color: WHITE_60,
    fontSize: 17,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 520,
    marginBottom: 8,
  },

  // ── Category Buttons ──
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 32,
  },
  categoryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.3s ease' } as any,
    }),
  },
  categoryBtnActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  categoryBtnText: {
    color: WHITE_60,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  categoryBtnTextActive: {
    color: '#000',
  },

  // ── Filter Bar ──
  filterBar: {
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 48,
    ...Platform.select({ web: { backdropFilter: 'blur(10px)' } as any }),
  },
  filterScroll: {
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 10,
  },
  filterLabel: {
    color: WHITE_40,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginRight: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.2s ease' } as any }),
  },
  filterPillActive: {
    backgroundColor: GOLD_GLOW,
    borderColor: GOLD_DIM,
  },
  filterPillText: {
    color: WHITE_40,
    fontSize: 12,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: GOLD,
  },

  // ── Product Grid ──
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 40,
    maxWidth: 1400,
    width: '100%',
  },
  productCard: {
    width: 320,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        transition: 'all 0.4s ease',
        cursor: 'pointer',
      } as any,
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 15,
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    left: '25%',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.12,
    ...Platform.select({ web: { filter: 'blur(60px)' } as any }),
  },
  cardImageArea: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cardImage: {
    width: '60%',
    height: '85%',
  },
  cardContent: {
    padding: 24,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardName: {
    color: WHITE,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 12,
  },
  cardDivider: {
    width: 40,
    height: 2,
    backgroundColor: GOLD_DIM,
    borderRadius: 1,
    marginBottom: 16,
  },
  cardHighlights: {
    gap: 8,
    marginBottom: 20,
  },
  cardHighlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHighlightText: {
    color: WHITE_60,
    fontSize: 12,
    fontWeight: '400',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    color: WHITE,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  exploreBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // ── Empty State ──
  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: WHITE_40,
    fontSize: 16,
    marginBottom: 16,
  },
  resetText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // ── Brand Trust Footer ──
  trustSection: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    width: '100%',
  },
  trustLine: {
    width: 60,
    height: 1,
    backgroundColor: GOLD_DIM,
    marginVertical: 16,
  },
  trustLogo: {
    height: 50,
    width: 120,
    marginBottom: 16,
    opacity: 0.7,
  },
  trustText: {
    color: WHITE_40,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  // ── Floating Cart ──
  floatingCart: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 100,
  },
  floatingCartBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '800',
  },
});

// ════════════════════════════════════════════════
// PRODUCT DETAIL STYLES
// ════════════════════════════════════════════════
const dS = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8,8,8,0.97)',
    zIndex: 200,
    ...Platform.select({ web: { backdropFilter: 'blur(20px)' } as any }),
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: Platform.OS === 'web' ? 130 : 150,
    paddingHorizontal: 40,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 40,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 130 : 150,
    right: 40,
    zIndex: 210,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer', backdropFilter: 'blur(10px)' } as any,
    }),
  },

  // ── Spotlight ──
  spotlightSection: {
    flexDirection: 'row',
    gap: 60,
    paddingVertical: 40,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  spotlightLeft: {
    flex: 1,
    minWidth: 260,
    maxWidth: 400,
    height: 420,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.15,
    ...Platform.select({ web: { filter: 'blur(80px)' } as any }),
  },
  spotlightImage: {
    width: '80%',
    height: '90%',
  },
  spotlightRight: {
    flex: 1,
    minWidth: 260,
  },
  spotlightCategory: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  spotlightName: {
    color: WHITE,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 14,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  spotlightTagline: {
    color: WHITE_60,
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 24,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  ratingText: {
    color: WHITE_60,
    fontSize: 13,
    marginLeft: 8,
  },
  spotlightSize: {
    color: WHITE_40,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  spotlightPrice: {
    color: WHITE,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 28,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  addToCartText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  wishlistBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },

  // ── Sections ──
  section: {
    paddingVertical: 36,
  },
  sectionTitle: {
    color: WHITE,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 24,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  sectionDesc: {
    color: WHITE_60,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    width: '100%',
  },

  // ── Highlights ──
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  highlightCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 14,
  },
  highlightIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightLabel: {
    color: WHITE_60,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Benefits ──
  benefitsList: { gap: 18 },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  benefitText: {
    color: WHITE_60,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },

  // ── Tags ──
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Ingredients ──
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(201,168,76,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
  },
  ingredientText: {
    color: 'rgba(201,168,76,0.85)',
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Texture ──
  textureText: {
    color: WHITE_80,
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 2,
    marginBottom: 24,
  },
  fragranceLabel: {
    color: WHITE_40,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  fragranceText: {
    color: WHITE_60,
    fontSize: 15,
    fontWeight: '300',
  },

  // ── Usage ──
  usageGrid: {
    flexDirection: 'row',
    gap: 40,
    flexWrap: 'wrap',
  },
  usageCol: {
    flex: 1,
    minWidth: 240,
  },
  usageTitle: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  usageIconRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  usageText: {
    color: WHITE_60,
    fontSize: 14,
    lineHeight: 22,
  },

  // ── Suitable For ──
  suitableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  suitableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GOLD_GLOW,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  suitableText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Claims ──
  claimsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  claimItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 180,
  },
  claimText: {
    color: WHITE_60,
    fontSize: 14,
  },
  safetyBlock: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  safetyLabel: {
    color: WHITE_40,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  safetyValue: {
    color: WHITE_60,
    fontWeight: '400',
  },

  // ── Brand ──
  brandSection: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  goldLine: {
    width: 60,
    height: 1,
    backgroundColor: GOLD_DIM,
    marginVertical: 16,
  },
  brandName: {
    color: GOLD,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 8,
    marginBottom: 8,
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  brandSub: {
    color: WHITE_40,
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: 4,
  },

  // ── Reviews ──
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  ratingBig: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBigText: {
    color: WHITE,
    fontSize: 28,
    fontWeight: '800',
  },
  ratingBigSub: {
    color: WHITE_40,
    fontSize: 14,
  },
  reviewGrid: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 14,
  },
  reviewText: {
    color: WHITE_60,
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  reviewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorText: {
    color: WHITE_40,
    fontSize: 12,
    fontWeight: '600',
  },
});

// ════════════════════════════════════════════════
// CART DRAWER STYLES
// ════════════════════════════════════════════════
const cS = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: Math.min(380, SW * 0.85),
    backgroundColor: 'rgba(12,12,12,0.98)',
    borderLeftWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 300,
    ...Platform.select({ web: { backdropFilter: 'blur(30px)' } as any }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 130 : 150,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  itemsList: {
    flex: 1,
    padding: 24,
  },
  emptyText: {
    color: WHITE_40,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cartImage: {
    width: 60,
    height: 60,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cartItemSize: {
    color: WHITE_40,
    fontSize: 11,
    marginTop: 2,
  },
  cartItemPrice: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  cartQty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: WHITE_20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  qtyBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  qtyText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    color: WHITE_40,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  totalValue: {
    color: WHITE,
    fontSize: 24,
    fontWeight: '800',
  },
  checkoutBtn: {
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  checkoutText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
