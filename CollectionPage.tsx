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
  useWindowDimensions,
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
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
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
const isMobileDevice = SW < 768;
const isMobileSS = SW < 768; // static for StyleSheet (computed once)

// ════════════════════════════════════════════════
// WHITE GOLD LUXURY THEME
// ════════════════════════════════════════════════
const CREAM = '#FDFBF7';
const CREAM_WARM = '#F4EFEA';
const CREAM_SOFT = '#FAF9F6';
const GLASS_BG = 'rgba(0, 0, 0, 0.04)';
const GLASS_BG_STRONG = 'rgba(0, 0, 0, 0.07)';
const GLASS_BORDER = 'rgba(0, 0, 0, 0.06)';
const GLASS_BORDER_GOLD = 'rgba(233, 195, 73, 0.25)';
const GOLD = '#e9c349';
const GOLD_HIGHLIGHT = '#FFD700';
const GOLD_DEEP = '#B8962E';
const GOLD_LIGHT = 'rgba(233, 195, 73, 0.08)';
const GOLD_BORDER = 'rgba(233, 195, 73, 0.15)';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = 'rgba(26, 26, 26, 0.7)';
const TEXT_MUTED = 'rgba(26, 26, 26, 0.4)';
const TEXT_LIGHT = '#1A1A1A';
const BORDER = 'rgba(0, 0, 0, 0.06)';
const BORDER_GOLD = 'rgba(233, 195, 73, 0.12)';
const WHITE = '#FFFFFF';
const SERIF = Platform.select({
  web: 'Georgia, "Playfair Display", "Times New Roman", serif',
  default: undefined,
});

// ════════════════════════════════════════════════
// PRODUCT DATA
// ════════════════════════════════════════════════
export const COLLECTION_PRODUCTS = [
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
    image: require('./assets/facewashproductcard.png'),
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
    storyImage: require('./assets/facewash_story.jpg'),
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
    image: require('./assets/hairserumproductcard.png'),
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
    image: require('./assets/faceserumproductcard.png'),
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
    image: require('./assets/night cream product cARD.png'),
    video: require('./assets/Skincare_jar_rotating_on_pedestal_delpmaspu_.mp4'),
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
  {
    id: 'hairoil',
    name: 'ULTRA SENSITIVE HAIR GROWTH ELIXIR HAIR OIL',
    shortName: 'HAIR OIL',
    displayName: 'Hair Growth Elixir',
    subtitle: 'Ultra Sensitive Care',
    category: 'hair',
    tagline: 'Gentle Herbal Care • Hair Growth Support • Scalp Nourishment',
    price: 299,
    priceDisplay: '₹299.00',
    size: '100 ML',
    sizeDetail: '100 ml (3.38 fl oz)',
    rating: 4.7,
    image: require('./assets/hairoil.jpeg'),
    themeColor: '#C9A227',
    themeBg: '#FDFBF7',
    themeGradient: ['#FDFBF7', '#F6F0DF'] as [string, string],
    highlights: [
      { icon: 'leaf', label: 'Female scalp care herbal oil blend' },
      { icon: 'droplets', label: 'Lightweight & non-sticky' },
      { icon: 'sparkles', label: 'Vitamins & conditioning actives' },
    ],
    benefits: [
      'Helps support healthy hair growth',
      'Nourishes and strengthens hair roots',
      'Improves scalp health and hydration',
      'Helps reduce dryness and hair fall',
      'Makes hair softer, smoother and shinier',
    ],
    concerns: ['Hair Fall', 'Weak Roots', 'Dry Scalp', 'Slow Hair Growth'],
    description: 'A gentle herbal hair oil formulated with nourishing carrier oils, botanical extracts and scalp-conditioning actives to support healthy hair growth, strengthen roots and maintain a balanced scalp environment.',
    storyTitle: 'The Root Ritual',
    storyText: 'A lightweight infusion that deeply nourishes the scalp without feeling tacky. Designed exclusively for sensitive, dry profiles experiencing weak roots.',
    stats: [
      { value: '96%', label: 'STRONGER ROOTS' },
      { value: '92%', label: 'LESS HAIR FALL' },
      { value: '98%', label: 'SCALP HYDRATION' },
    ],
    featuredIngredients: [
      { name: 'Bhringraj & Amla', desc: 'Renowned Ayurvedic herbs that actively stimulate follicles and support robust hair growth.' },
      { name: 'Sugarcane Squalane', desc: 'A deeply hydrating, weightless active that smooths hair cuticles and provides brilliant shine.' },
      { name: 'Caffeine', desc: 'Energizes the scalp ecosystem and offsets factors that lead to thinning.' },
    ],
    allIngredients: ['Coconut MCT Oil', 'Black Sesame Oil', 'Jojoba Oil', 'Argan Oil', 'Castor Oil', 'Bhringraj Extract', 'Amla Extract', 'Fenugreek Extract', 'Hibiscus Extract', 'Brahmi Extract', 'Gotu Kola Extract', 'Sugarcane Squalane', 'Vitamin E', 'Caffeine'],
    texture: 'Lightweight, Smooth, Non-sticky Oil',
    fragrance: 'Mild Herbal Aroma with Natural Essential Oils',
    howToUse: 'Take a small amount of oil and gently massage onto scalp and hair roots. Leave for a few hours or overnight before washing with a mild shampoo.',
    whenToUse: '2–3 times a week or as needed',
    suitableFor: ['Normal', 'Dry', 'Weak & Sensitive Scalp Hair Types'],
    claims: ['Preservative Free', 'Silicone Free', 'Mineral Oil Free', 'Gentle Herbal Formula'],
    shelfLife: '24 Months',
    brand: 'D A LUXE',
    madeIn: 'India',
    reviews: [
      { text: 'Nourishes scalp and strengthens hair roots!', author: 'Sneha R.', rating: 5 },
      { text: 'Lightweight and non-greasy oil, I can leave it on overnight comfortably.', author: 'Riya K.', rating: 5 },
      { text: 'Suitable for regular scalp massage, saw baby hairs coming in.', author: 'Aarti M.', rating: 4.5 },
    ],
  },
  {
    id: 'hairshampoo',
    name: 'ULTRA SENSITIVE CALM & CLEAN HAIR SHAMPOO',
    shortName: 'SHAMPOO',
    displayName: 'Calm & Clean Shampoo',
    subtitle: 'Ultra Sensitive Care',
    category: 'hair',
    tagline: 'Gentle Herbal Cleanse • No-Itch Comfort • Sensitive Scalp Care',
    price: 249,
    priceDisplay: '₹249.00',
    size: '100 ML',
    sizeDetail: '100 ml (3.38 fl oz)',
    rating: 4.7,
    image: require('./assets/hairshampoo.jpeg'),
    themeColor: '#7A918D',
    themeBg: '#F2F5F4',
    themeGradient: ['#F2F5F4', '#E8ECEB'] as [string, string],
    highlights: [
      { icon: 'droplets', label: 'Reduced saponin blend for gentle washing' },
      { icon: 'leaf', label: 'Anti-itch soothing botanical extracts' },
      { icon: 'sparkles', label: 'Lightweight conditioning for soft hair' },
    ],
    benefits: [
      'Gently cleanses hair without irritation',
      'Helps soothe itchy and sensitive scalp',
      'Maintains scalp hydration and balance',
      'Leaves hair soft, smooth and manageable',
      'Suitable for regular gentle cleansing',
    ],
    concerns: ['Sensitive Scalp', 'Itching', 'Dryness', 'Mild Irritation'],
    description: 'A mild herbal shampoo specially designed for sensitive female scalp. Enriched with botanical extracts and soothing actives that gently cleanse hair while helping reduce scalp irritation and dryness.',
    storyTitle: 'The Pure Cleanse',
    storyText: 'A sulfate-free, deeply soothing rinse that respects the sensitive barrier of your scalp, eliminating itch without stripping away essential moisture.',
    stats: [
      { value: '97%', label: 'ITCH RELIEF' },
      { value: '95%', label: 'SCALP COMFORT' },
      { value: '94%', label: 'SOFTER HAIR' },
    ],
    featuredIngredients: [
      { name: 'Reetha & Shikakai', desc: 'Natural saponins that provide a mild, non-stripping cleanse perfect for delicate barriers.' },
      { name: 'Aloe Vera & Allantoin', desc: 'Super-soothing complexes that instantly calm irritation, redness, and itching.' },
      { name: 'Panthenol (Vitamin B5)', desc: 'Penetrates the hair shaft to lock in intense moisture and boost elasticity.' },
    ],
    allIngredients: ['Reetha Extract', 'Shikakai Extract', 'Amla Extract', 'Aloe Vera Extract', 'Licorice Extract', 'Neem Extract', 'Fenugreek Extract', 'Hibiscus Extract', 'Bhringraj Extract', 'Virgin Coconut Oil', 'Castor Oil', 'Panthenol (Vitamin B5)', 'Allantoin', 'Vitamin E'],
    texture: 'Lightweight Liquid Shampoo, Smooth Foam',
    fragrance: 'Mild Herbal Fragrance',
    howToUse: 'Apply a small amount of shampoo on wet hair. Massage gently into scalp and hair. Rinse thoroughly with water.',
    whenToUse: '2–3 times per week or as needed',
    suitableFor: ['Sensitive', 'Dry', 'Itchy & Normal Scalp'],
    claims: ['Paraben Free', 'Silicone Free', 'Gentle Herbal Formula', 'Suitable for Sensitive Scalp'],
    shelfLife: '24 Months',
    brand: 'D A LUXE',
    madeIn: 'India',
    reviews: [
      { text: 'Gentle cleansing without irritation, finally a shampoo that works.', author: 'Kriti S.', rating: 5 },
      { text: 'Soothes my itchy scalp perfectly, highly recommend!', author: 'Priyanka D.', rating: 4.5 },
      { text: 'Leaves hair soft and manageable all day long.', author: 'Meera T.', rating: 5 },
    ],
  }
];

export type ProductType = typeof COLLECTION_PRODUCTS[0] & { storyImage?: any; video?: any };
export type CartItem = { product: ProductType; quantity: number };

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
// FLY-TO-CART ANIMATION
// ════════════════════════════════════════════════
type FlyItem = {
  id: string;
  image: any;
  startX: number;
  startY: number;
};

const FlyToCartOverlay = ({ items, onComplete }: {
  items: FlyItem[];
  onComplete: (id: string) => void;
}) => {
  return (
    <>
      {items.map((item) => (
        <FlyingProduct key={item.id} item={item} onComplete={() => onComplete(item.id)} />
      ))}
    </>
  );
};

const FlyingProduct = ({ item, onComplete }: { item: FlyItem; onComplete: () => void }) => {
  const progress = useSharedValue(0);
  const glowOpacity = useSharedValue(1);

  // Target: cart icon at top-right
  const targetX = SW - 50;
  const targetY = Platform.OS === 'web' ? 40 : 60;
  // Use clientY (viewport-relative) for the start position
  const startX = item.startX;
  const startY = item.startY;

  useEffect(() => {
    progress.value = withTiming(1, { duration: 800, easing: Easing.bezier(0.4, 0, 0.2, 1) }, (finished) => {
      if (finished) {
        runOnJS(onComplete)();
      }
    });
    // Gold glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 150 }),
        withTiming(1, { duration: 150 }),
      ),
      3,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const t = progress.value;

    // Curved arc path using quadratic bezier
    const midX = (startX + targetX) / 2;
    const midY = Math.min(startY, targetY) - 150; // Arc above

    const oneMinusT = 1 - t;
    const x = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * midX + t * t * targetX;
    const y = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * midY + t * t * targetY;

    const scale = interpolate(t, [0, 0.15, 0.5, 1], [0.3, 1, 0.65, 0.15], Extrapolation.CLAMP);
    const opacity = interpolate(t, [0, 0.1, 0.8, 1], [0.5, 1, 1, 0], Extrapolation.CLAMP);
    const rotate = interpolate(t, [0, 1], [0, 20], Extrapolation.CLAMP);

    return {
      position: 'absolute' as const,
      left: x - 35,
      top: y - 35,
      width: 70,
      height: 70,
      transform: [{ scale }, { rotate: `${rotate}deg` }],
      opacity,
      zIndex: 9999,
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={animStyle} pointerEvents="none">
      <Animated.View style={[{
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: WHITE,
        borderWidth: 2.5, borderColor: '#FFD700',
        overflow: 'hidden',
        justifyContent: 'center', alignItems: 'center',
        ...Platform.select({
          web: {
            boxShadow: '0 0 20px rgba(255,215,0,0.5), 0 4px 15px rgba(212,175,55,0.3)',
          } as any,
        }),
        shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
      }, glowStyle]}>
        <Image source={item.image} style={{ width: 56, height: 56 }} resizeMode="contain" />
      </Animated.View>
    </Animated.View>
  );
};

// ════════════════════════════════════════════════
// CART BADGE BOUNCE (used at app level)
// ════════════════════════════════════════════════

// ════════════════════════════════════════════════
// PREMIUM GOLD CART BUTTON
// ════════════════════════════════════════════════
const GoldCartButton = ({ onPress, label = 'Add to Cart', compact = false }: {
  onPress: (x: number, y: number) => void;
  label?: string;
  compact?: boolean;
}) => {
  const shimmerX = useSharedValue(-1);
  const glowOpacity = useSharedValue(0.15);

  React.useEffect(() => {
    shimmerX.value = withRepeat(withSequence(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), withTiming(-1, { duration: 0 })), -1);
    glowOpacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }), withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.ease) })), -1, true);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerX.value, [-1, 1], [-200, 200]) }, { skewX: '-20deg' }],
    opacity: interpolate(shimmerX.value, [-1, -0.3, 0, 0.3, 1], [0, 0, 0.6, 0, 0]),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    ...Platform.select({ web: { boxShadow: `0 0 40px -8px rgba(233, 195, 73, ${glowOpacity.value})` } as any }),
    shadowColor: GOLD, shadowOffset: { width: 0, height: 0 }, shadowOpacity: glowOpacity.value, shadowRadius: 20,
  }));

  const handlePress = (e: any) => {
    // Get press coordinates - prefer clientX/Y (viewport relative) for absolute positioning
    const ne = e?.nativeEvent;
    let px = SW / 2;
    let py = SH / 2;
    if (ne) {
      px = ne.clientX ?? ne.pageX ?? ne.locationX ?? px;
      py = ne.clientY ?? ne.pageY ?? ne.locationY ?? py;
    }
    // Fallback: try underlying DOM event
    if (Platform.OS === 'web' && e?.target) {
      try {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        px = rect.left + rect.width / 2;
        py = rect.top + rect.height / 2;
      } catch {}
    }
    onPress(px, py);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={[glowStyle, { borderRadius: compact ? 22 : 28 }]}>
        <View style={[goldBtn.container, compact && goldBtn.containerCompact]}>
          <LinearGradient colors={[GOLD, '#524000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: compact ? 22 : 28 }]} />
          <Animated.View style={[goldBtn.shimmer, shimmerStyle]} pointerEvents="none">
             <LinearGradient colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ width: '100%', height: '100%' }} />
          </Animated.View>
          <Text style={[goldBtn.text, compact && goldBtn.textCompact]}>{label}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const goldBtn = StyleSheet.create({
  container: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#d4af37', // This will be covered by LinearGradient, but kept for consistency
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(12px)',
      } as any,
    }),
  },
  containerCompact: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginTop: 10,
    borderRadius: 22, // Adjusted for compact
  },
  hovered: { // This style is no longer directly used due to TouchableOpacity
    ...Platform.select({
      web: {
        transform: 'translateY(-2px) scale(1.02)',
        boxShadow: '0 8px 30px rgba(212, 175, 55, 0.40), 0 0 16px rgba(255,215,0,0.15)',
        borderColor: '#FFD700',
      } as any,
    }),
  },
  pressed: { // This style is no longer directly used due to TouchableOpacity
    borderColor: '#B8962E',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80, // This width will be overridden by the shimmerStyle's width: '100%'
    left: '50%', // This will be overridden by the shimmerStyle's translateX
  },
  text: {
    color: '#3c2f00', // Darker text for metallic look
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3, // Increased letter spacing
    textTransform: 'uppercase',
    ...Platform.select({ web: { fontFamily: SERIF } as any }),
  },
  textCompact: {
    fontSize: 12,
    letterSpacing: 1.5,
  },
});

// ════════════════════════════════════════════════
// COLLECTION HERO SPLASH
// ════════════════════════════════════════════════
const CollectionHero = ({ scrollY }: { scrollY?: any }) => {
  const { width: winW, height: winH } = useWindowDimensions();
  const isMob = winW < 768;
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.1, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = scrollY ? interpolate(scrollY.value, [-200, 0, 1000], [-100, 0, 400], Extrapolation.CLAMP) : 0;
    return {
      transform: [
        { translateY },
        { scale: scale.value }
      ],
    };
  });

  const reflectionStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[g.splashHeroContainer, isMob && { height: winH * 0.7 }]}>
      <Animated.View style={[g.splashImageWrapper, animatedStyle]}>
        <Image
          source={require('./assets/hero_background_new.jpg')}
          style={[{ width: '100%', height: '100%' }, Platform.select({ web: { objectPosition: 'center' } as any })]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'transparent', 'transparent', 'rgba(0,0,0,0.2)']}
          locations={[0, 0.2, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.05)' }]} pointerEvents="none" />
        <Animated.View style={[StyleSheet.absoluteFillObject, g.lightReflectionLayer, reflectionStyle]} pointerEvents="none" />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(400).duration(2000)} style={g.splashTextContent}>
        <Text style={g.splashOverline}>DISCOVER</Text>
        <Text style={[g.splashTitle, isMob && { fontSize: 28, letterSpacing: 3 }]}>THE D A LUXE COLLECTION</Text>
        <Text style={[g.splashSubtitle, isMob && { fontSize: 13, maxWidth: 300 }]}>
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
  activeConcern,
  onClearConcern,
  products,
  onSelectProduct,
  onAddToCart,
  scrollY,
}: {
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  activeConcern?: string | null;
  onClearConcern?: () => void;
  products: ProductType[];
  onSelectProduct: (p: ProductType) => void;
  onAddToCart?: (p: ProductType, startX?: number, startY?: number) => void;
  scrollY?: any;
}) => {
  const { width: winW } = useWindowDimensions();
  const isMob = winW < 768;

  return (
    <>
      {/* Splash Hero Introduction */}
      <CollectionHero scrollY={scrollY} />

      {/* Hero */}
      <View style={[g.hero, isMob && { paddingVertical: 36, paddingHorizontal: 16 }]}>
        <Animated.View entering={FadeInDown.duration(600)} style={g.heroInner}>
          <View style={g.heroGoldLine} />
          <Text style={[g.heroTitle, isMob && { fontSize: 32 }]}>The Collection</Text>
          <View style={g.heroGoldLine} />
        </Animated.View>

        {/* Category Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={isMob ? { marginTop: 20, marginBottom: 10 } : undefined}>
          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={[g.categoryRow, isMob && { flexWrap: 'nowrap', gap: 8, marginTop: 0, marginBottom: 0 }]}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={({ hovered }: any) => [
                  g.categoryBtn,
                  isMob && { paddingHorizontal: 18, paddingVertical: 10 },
                  activeCategory === cat.id && g.categoryBtnActive,
                  hovered && activeCategory !== cat.id && Platform.OS === 'web' && g.categoryBtnHovered,
                ]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text style={[g.categoryBtnText, activeCategory === cat.id && g.categoryBtnTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </ScrollView>
      </View>

      {/* Product Grid */}
      <View style={[g.grid, isMob && { paddingHorizontal: 16, gap: 20 }]}>
        {activeConcern && (
          <Animated.View entering={FadeInDown.duration(400)} style={g.activeConcernHeader}>
            <Text style={g.activeConcernText}>Showing results for <Text style={{ fontWeight: '700', color: GOLD_DEEP }}>{getConcernLabel(activeConcern)}</Text></Text>
            <TouchableOpacity onPress={onClearConcern} style={g.clearConcernBtn}>
              <Text style={g.clearConcernText}>Clear filter ×</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {products.map((product, index) => (
          <Animated.View
            key={product.id}
            entering={FadeInUp.delay(index * 120).duration(500)}
            style={isMob ? { width: '100%' } : undefined}
          >
            <Pressable
              style={({ hovered }: any) => [
                g.card,
                isMob && { width: '100%' },
                hovered && Platform.OS === 'web' && g.cardHovered,
              ]}
              onPress={() => onSelectProduct(product)}
            >
              {/* Product Image */}
              <View style={[g.cardImageArea, { backgroundColor: 'transparent' }, isMob && { height: 240 }]}>
                <Image source={product.image} style={g.cardImage} resizeMode="contain" />
                {product.rating >= 4.5 && (
                  <View style={g.ratingBadge}>
                    <Star color={GOLD_HIGHLIGHT} size={14} fill={GOLD_HIGHLIGHT} />
                    <Text style={g.ratingBadgeText}>{product.rating}</Text>
                  </View>
                )}
              </View>

              {/* Card Info */}
              <View style={g.cardInfo}>
                <Text style={g.cardSubtitle}>{product.subtitle}</Text>
                <Text style={g.cardName}>{product.shortName}</Text>
                <Text style={g.cardDesc} numberOfLines={2}>{product.description}</Text>
                <Text style={g.cardPrice}>{product.priceDisplay}</Text>
                <GoldCartButton
                  onPress={(x, y) => onAddToCart?.(product, x, y)}
                  compact
                />
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {products.length === 0 && (
          <View style={g.emptyState}>
            <Text style={g.emptyText}>{activeConcern ? 'No products found for this concern.' : 'No products match this category.'}</Text>
            <TouchableOpacity onPress={() => { setActiveCategory('all'); onClearConcern?.(); }}>
              <Text style={g.resetText}>View All Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Trust Section */}
      <View style={[g.trustSection, isMob && { paddingVertical: 36, paddingHorizontal: 16 }]}>
        <View style={[g.trustRow, isMob && { gap: 12 }]}>
          <View style={[g.trustItem, isMob && { width: 140, paddingVertical: 18, paddingHorizontal: 12 }]}>
            <Gift color={GOLD} size={isMob ? 22 : 28} />
            <Text style={g.trustItemTitle}>Exclusive Formulas</Text>
            <Text style={g.trustItemSub}>Dermal-grade botanicals</Text>
          </View>
          <View style={[g.trustItem, isMob && { width: 140, paddingVertical: 18, paddingHorizontal: 12 }]}>
            <Award color={GOLD} size={isMob ? 22 : 28} />
            <Text style={g.trustItemTitle}>ISO & GMP Certified</Text>
            <Text style={g.trustItemSub}>Quality guaranteed</Text>
          </View>
          <View style={[g.trustItem, isMob && { width: 140, paddingVertical: 18, paddingHorizontal: 12 }]}>
            <Shield color={GOLD} size={isMob ? 22 : 28} />
            <Text style={g.trustItemTitle}>Sensitive Safe</Text>
            <Text style={g.trustItemSub}>Gentle on all skin</Text>
          </View>
          <View style={[g.trustItem, isMob && { width: 140, paddingVertical: 18, paddingHorizontal: 12 }]}>
            <Leaf color={GOLD} size={isMob ? 22 : 28} />
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
const DiscoverSlider = ({ products, onSelectProduct }: { products: ProductType[]; onSelectProduct: (p: ProductType) => void }) => {
  const scrollRef = useRef<ScrollView>(null);
  const { width: winW } = useWindowDimensions();
  const cardW = winW * 0.65;
  const isMob = winW < 768;

  useEffect(() => {
    if (!isMob) return;
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % products.length;
      scrollRef.current?.scrollTo({ x: idx * (cardW + 16), animated: true });
    }, 3000);
    return () => clearInterval(timer);
  }, [isMob, products.length, cardW]);

  if (!isMob) {
    return (
      <View style={d.discoverGrid}>
        {products.map((p) => (
          <TouchableOpacity key={p.id} style={d.discoverCard} onPress={() => onSelectProduct(p)} activeOpacity={0.7}>
            <View style={[d.discoverImageBg, { backgroundColor: p.themeBg }]}>
              <Image source={p.image} style={d.discoverImage} resizeMode="contain" />
            </View>
            <Text style={d.discoverName}>{p.shortName}</Text>
            <Text style={d.discoverSub}>{p.description.slice(0, 60)}...</Text>
            <Text style={d.discoverPrice}>{p.priceDisplay}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardW + 16}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
    >
      {products.map((p) => (
        <TouchableOpacity key={p.id} style={[d.discoverCard, { width: cardW }]} onPress={() => onSelectProduct(p)} activeOpacity={0.7}>
          <View style={[d.discoverImageBg, { backgroundColor: p.themeBg, height: 200 }]}>
            <Image source={p.image} style={d.discoverImage} resizeMode="contain" />
          </View>
          <Text style={d.discoverName}>{p.shortName}</Text>
          <Text style={d.discoverSub}>{p.description.slice(0, 60)}...</Text>
          <Text style={d.discoverPrice}>{p.priceDisplay}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const ProductLandingPage = ({
  product,
  onBack,
  onAddToCart,
  allProducts,
  onSelectProduct,
}: {
  product: ProductType;
  onBack: () => void;
  onAddToCart: (p: ProductType, startX?: number, startY?: number) => void;
  allProducts: ProductType[];
  onSelectProduct: (p: ProductType) => void;
}) => {
  const otherProducts = allProducts.filter((p) => p.id !== product.id);
  const { width: winW } = useWindowDimensions();
  const isMob = winW < 768;

  return (
    <>
      {/* ── Section 1: Product Hero ── */}
      <View style={[d.heroSection, isMob && { paddingHorizontal: 16 }]}>
        {/* Breadcrumb */}
        <TouchableOpacity style={d.breadcrumb} onPress={onBack} activeOpacity={0.6} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <ArrowLeft color={TEXT_MUTED} size={16} />
          <Text style={d.breadcrumbText}>Collection</Text>
          <Text style={d.breadcrumbSep}>/</Text>
          <Text style={d.breadcrumbCurrent}>{product.displayName}</Text>
        </TouchableOpacity>

        <View style={[d.heroRow, isMob && { flexDirection: 'column', gap: 24 }]}>
          {/* Product Image */}
          <Animated.View entering={FadeInLeft.duration(600).delay(100)} style={[d.heroImageCol, isMob && { minWidth: '100%', maxWidth: '100%' }]}>
            <View style={[d.heroImageBg, { backgroundColor: 'transparent', overflow: 'hidden' }]}>
              <Image source={product.image} style={[d.heroImage, { width: '100%', height: '100%' }]} resizeMode="contain" />
            </View>
          </Animated.View>

          {/* Product Info */}
          <Animated.View entering={FadeInRight.delay(200).duration(500)} style={[d.heroInfoCol, isMob && { minWidth: '100%', paddingTop: 0 }]}>
            <Text style={d.heroSubtitle}>{product.subtitle}</Text>
            <Text style={[d.heroName, isMob && { fontSize: 28 }]}>{product.shortName}</Text>
            <Text style={d.heroTagline}>{product.tagline}</Text>
            <Text style={d.heroDesc}>{product.description}</Text>

            <View style={d.heroDivider} />

            <View style={d.heroPriceRow}>
              <Text style={d.heroSize}>{product.size}</Text>
              <Text style={d.heroPrice}>{product.priceDisplay}</Text>
            </View>

            <View style={{ alignSelf: isMob ? 'center' : 'flex-start' }}>
              <GoldCartButton
                onPress={(x, y) => onAddToCart(product, x, y)}
                label="ADD TO CART"
              />
            </View>

            <View style={d.trustBadges}>
              {product.rating >= 4.5 && (
                <View style={d.trustBadge}>
                  <Star color={GOLD_HIGHLIGHT} size={15} fill={GOLD_HIGHLIGHT} />
                  <Text style={d.trustBadgeText}>{product.rating} / 5 — Loved by customers</Text>
                </View>
              )}
              <View style={d.trustBadge}>
                <Check color={GOLD} size={16} />
                <Text style={d.trustBadgeText}>Guaranteed authenticity</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* ── Section 2: Stats / Results ── */}
      <View style={[d.statsSection, isMob && { paddingHorizontal: 16, paddingVertical: 36 }]}>
        <Text style={[d.statsHeading, isMob && { fontSize: 26, lineHeight: 34 }]}>Measured and{'\n'}perceived results</Text>
        <View style={[d.statsRow, isMob && { justifyContent: 'center' }]}>
          {product.stats.map((stat, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(i * 150).duration(500)}
              style={[d.statItem, isMob && { minWidth: 100 }]}
            >
              <Text style={[d.statValue, { color: product.themeColor }, isMob && { fontSize: 36 }]}>{stat.value}</Text>
              <Text style={d.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ── Section 3: Product Story ── */}
      <View style={[d.storySection, isMob && { flexDirection: 'column' }]}>
        <View style={[
          d.storyImageCol,
          { backgroundColor: 'transparent', alignSelf: 'center', justifyContent: 'center' },
          isMob && { minWidth: '100%', minHeight: 250 }
        ]}>
          {product.video ? (
            <View style={{ width: '100%', overflow: 'hidden', borderRadius: 8 }}>
              <Video
                source={product.video}
                style={{ width: '100%', aspectRatio: 16 / 9 }}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted
              />
            </View>
          ) : (
            <Image source={product.storyImage || product.image} style={d.storyImage} resizeMode="contain" />
          )}
        </View>
        <View style={[d.storyTextCol, isMob && { padding: 24, minWidth: '100%' }]}>
          <Text style={[d.storyTitle, isMob && { fontSize: 24 }]}>{product.storyTitle}</Text>
          <Text style={d.storyText}>{product.storyText}</Text>
          <Text style={d.storyDesc}>{product.description}</Text>
        </View>
      </View>

      {/* ── Section 4: Key Benefits ── */}
      <View style={[d.benefitsSection, isMob && { paddingHorizontal: 16, paddingVertical: 36 }]}>
        <Text style={[d.sectionHeading, isMob && { fontSize: 24, lineHeight: 32 }]}>Key Benefits</Text>
        <View style={d.benefitsGrid}>
          <View style={[d.benefitsListCol, isMob && { minWidth: '100%' }]}>
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

      {/* ── Section 5: Ingredients ── */}
      <View style={[d.ingredientsSection, isMob && { paddingHorizontal: 16, paddingVertical: 36 }]}>
        <Text style={[d.sectionHeading, isMob && { fontSize: 24, lineHeight: 32 }]}>What you put on{'\n'}your skin matters</Text>
        <View style={[d.ingredientCardsRow, isMob && { flexDirection: 'column', gap: 24 }]}>
          {product.featuredIngredients.map((ing, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(i * 150).duration(500)}
              style={[d.ingredientCard, isMob && { minWidth: '100%' }]}
            >
              <View style={[d.ingredientCircle, { backgroundColor: product.themeBg, borderColor: product.themeColor + '30' }, isMob && { width: 90, height: 90, borderRadius: 45 }]}>
                <Sparkles color={product.themeColor} size={isMob ? 22 : 28} />
              </View>
              <Text style={d.ingredientName}>{ing.name}</Text>
              <Text style={[d.ingredientDesc, isMob && { maxWidth: '100%' }]}>{ing.desc}</Text>
            </Animated.View>
          ))}
        </View>

        {/* All Ingredients List */}
        <View style={[d.allIngredientsBox, isMob && { padding: 16 }]}>
          <Text style={d.allIngredientsTitle}>Full Ingredient List</Text>
          <Text style={d.allIngredientsList}>
            {product.allIngredients.join(' \u00B7 ')}
          </Text>
        </View>
      </View>

      {/* ── Section 6: Texture & How to Use ── */}
      <View style={[d.usageSection, isMob && { paddingHorizontal: 16, paddingVertical: 36 }]}>
        <View style={[d.usageGrid, isMob && { flexDirection: 'column', gap: 24 }]}>
          <View style={[d.usageCol, isMob && { minWidth: '100%' }]}>
            <Text style={d.usageColTitle}>Texture & Feel</Text>
            <Text style={d.usageText}>{product.texture}</Text>
            <View style={{ height: 16 }} />
            <Text style={d.usageSmallLabel}>Fragrance</Text>
            <Text style={d.usageText}>{product.fragrance}</Text>
          </View>
          {!isMob && <View style={d.usageDividerV} />}
          {isMob && <View style={{ width: '100%', height: 1, backgroundColor: BORDER }} />}
          <View style={[d.usageCol, isMob && { minWidth: '100%' }]}>
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
      <View style={[d.idealSection, isMob && { paddingHorizontal: 16, paddingVertical: 36 }]}>
        <Text style={[d.idealTitle, isMob && { fontSize: 24 }]}>This product is ideal for</Text>
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
      <View style={[d.reviewsSection, isMob && { paddingHorizontal: 0 }]}>
        <Text style={[d.reviewsHeading, isMob && { fontSize: 22 }]}>Customer Reviews</Text>
        <Text style={d.reviewsSubheading}>{product.displayName}</Text>
        <View style={d.reviewsStarsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} color={GOLD_HIGHLIGHT} size={20} fill={GOLD_HIGHLIGHT} />
          ))}
          <Text style={d.reviewsRating}>{product.rating} / 5</Text>
        </View>
        <View style={[d.reviewsList, isMob && { paddingHorizontal: 16 }]}>
          {product.reviews.map((r, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(i * 100).duration(400)}
              style={d.reviewCard}
            >
              <View style={d.reviewStarsSmall}>
                {[1, 2, 3, 4, 5].map((j) => (
                  <Star key={j} color={GOLD_HIGHLIGHT} size={13} fill={j <= r.rating ? GOLD_HIGHLIGHT : 'transparent'} />
                ))}
              </View>
              <Text style={d.reviewText}>&ldquo;{r.text}&rdquo;</Text>
              <Text style={d.reviewAuthor}>{r.author}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ── Section 9: Discover More (auto-scroll on mobile) ── */}
      <View style={[d.discoverSection, isMob && { paddingHorizontal: 0 }]}>
        <Text style={[d.discoverHeading, isMob && { fontSize: 22, paddingHorizontal: 16 }]}>Discover the Collection</Text>
        <DiscoverSlider products={otherProducts} onSelectProduct={onSelectProduct} />
      </View>

      {/* Footer */}
      <View style={[d.footerSection, isMob && { paddingHorizontal: 16 }]}>
        <View style={[d.footerTrustRow, isMob && { gap: 16 }]}>
          <View style={[d.footerTrustItem, isMob && { width: 120 }]}>
            <Gift color={GOLD} size={isMob ? 18 : 22} />
            <Text style={d.footerTrustText}>Free Shipping{'\n'}over \u20B9500</Text>
          </View>
          <View style={[d.footerTrustItem, isMob && { width: 120 }]}>
            <Award color={GOLD} size={isMob ? 18 : 22} />
            <Text style={d.footerTrustText}>ISO & GMP{'\n'}Certified</Text>
          </View>
          <View style={[d.footerTrustItem, isMob && { width: 120 }]}>
            <Shield color={GOLD} size={isMob ? 18 : 22} />
            <Text style={d.footerTrustText}>Sensitive{'\n'}Skin Safe</Text>
          </View>
          <View style={[d.footerTrustItem, isMob && { width: 120 }]}>
            <Leaf color={GOLD} size={isMob ? 18 : 22} />
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
const StickyBottomBar = ({ product, onAddToCart }: { product: ProductType; onAddToCart: (p: ProductType, startX?: number, startY?: number) => void }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={[sb.container, isMobile && { paddingHorizontal: 16, paddingVertical: 10 }]}>
      <View style={[sb.inner, isMobile && { gap: 12 }]}>
        <Image source={product.image} style={[sb.image, isMobile && { width: 36, height: 36 }]} resizeMode="contain" />
        <View style={sb.info}>
          <Text style={[sb.name, isMobile && { fontSize: 13 }]} numberOfLines={1}>{product.displayName}</Text>
          {!isMobile && <Text style={sb.sub} numberOfLines={1}>{product.subtitle}</Text>}
          {isMobile && <Text style={[sb.price, { fontSize: 13, marginTop: 2 }]} numberOfLines={1}>{product.priceDisplay}</Text>}
        </View>
        {!isMobile && <Text style={sb.size}>{product.size}</Text>}
        {!isMobile && <Text style={sb.price}>{product.priceDisplay}</Text>}
        <TouchableOpacity style={[sb.cartBtn, isMobile && { paddingHorizontal: 16, paddingVertical: 10 }]} onPress={() => onAddToCart(product, SW - 50, 40)} activeOpacity={0.8}>
          <Text style={sb.cartBtnText}>{isMobile ? 'ADD' : 'ADD TO CART'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ════════════════════════════════════════════════
// CART DRAWER — Premium Redesign
// ════════════════════════════════════════════════
export const CartDrawer = ({
  items, visible, onClose, onUpdateQuantity, onRemove, onCheckout,
}: {
  items: CartItem[]; visible: boolean; onClose: () => void;
  onUpdateQuantity: (id: string, qty: number) => void; onRemove: (id: string) => void;
  onCheckout?: () => void;
}) => {
  const translateX = useSharedValue(800);
  const overlayOpacity = useSharedValue(0);

  // Fix scroll lock bug: lock body scroll on web when cart is open
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      if (visible) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [visible]);

  React.useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 380, easing: Easing.out(Easing.ease) });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(800, { duration: 300, easing: Easing.in(Easing.ease) });
      overlayOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible && translateX.value >= 790) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={cart.overlay} pointerEvents={visible ? 'box-none' : 'none'}>
      <Animated.View style={[cart.backdrop, overlayStyle]}>
        <Pressable style={{ flex: 1 }} onPress={() => { if (visible) onClose(); }} />
      </Animated.View>

      <Animated.View style={[cart.drawer, drawerStyle]}>
        <View style={cart.header}>
          <View>
            <Text style={cart.headerTitle}>Your Cart</Text>
            <Text style={cart.headerSubtitle}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
          </View>
          <TouchableOpacity style={cart.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X color="#1A1A1A" size={20} />
          </TouchableOpacity>
        </View>

        <View style={cart.divider} />

        <ScrollView style={cart.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {items.length === 0 ? (
            <View style={cart.emptyContainer}>
              <View style={cart.emptyIcon}>
                <Text style={{ fontSize: 52 }}>🛍️</Text>
              </View>
              <Text style={cart.emptyTitle}>Nothing here</Text>
              <Text style={cart.emptySubtext}>Looks like you haven't added anything yet.</Text>
              <TouchableOpacity style={cart.exploreBtn} onPress={onClose} activeOpacity={0.85}>
                <Text style={cart.exploreBtnText}>Explore products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ paddingTop: 8 }}>
              {items.map((item, idx) => (
                <Animated.View key={item.product.id} entering={FadeInDown.delay(idx * 60).duration(300)} style={cart.item}>
                  <View style={cart.itemImgWrap}>
                    <Image source={item.product.image} style={cart.itemImg} resizeMode="contain" />
                  </View>
                  <View style={cart.itemInfo}>
                    <Text style={cart.itemName} numberOfLines={1}>{item.product.shortName}</Text>
                    <Text style={cart.itemSize}>{item.product.sizeDetail}</Text>
                    <Text style={cart.itemPrice}>{item.product.priceDisplay}</Text>
                    <View style={cart.qtyRow}>
                      <TouchableOpacity style={cart.qtyBtn} onPress={() => item.quantity > 1 ? onUpdateQuantity(item.product.id, item.quantity - 1) : onRemove(item.product.id)}>
                        <Text style={cart.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={cart.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity style={cart.qtyBtn} onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}>
                        <Text style={cart.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={cart.removeBtn} onPress={() => onRemove(item.product.id)}>
                    <X color="#999" size={14} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>

        {items.length > 0 && (
          <View style={cart.footer}>
            <View style={cart.totalRow}>
              <Text style={cart.totalLabel}>Order Total</Text>
              <Text style={cart.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
            </View>
            <Text style={cart.taxNote}>Inclusive of all taxes · Free shipping on orders ₹999+</Text>
            <TouchableOpacity style={cart.checkoutBtn} activeOpacity={0.85} onPress={() => { onClose(); onCheckout?.(); }}>
              <LinearGradient colors={['#C9A227', '#E9C349', '#C9A227']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={cart.checkoutGradient}>
                <Text style={cart.checkoutText}>PROCEED TO CHECKOUT</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

// ════════════════════════════════════════════════
// SMART MATCHING LOGIC
// ════════════════════════════════════════════════
const getConcernLabel = (id: string) => {
  const map: Record<string, string> = {
    acne: 'Acne Marks',
    pigmentation: 'Pigmentation',
    glowing: 'Glowing Skin',
    pores: 'Open Pores'
  };
  return map[id] || id;
};

const matchConcern = (product: ProductType, concernId: string) => {
  const CONCERN_MAP: Record<string, { direct: string[], benefits: string[], ingredients: string[] }> = {
    acne: {
      direct: ['Acne', 'Breakout'],
      benefits: ['Anti-acne', 'Oil control', 'Calming', 'Reduces redness'],
      ingredients: ['Neem', 'Tulsi', 'Salicylic']
    },
    pigmentation: {
      direct: ['Pigmentation', 'Dark spots', 'Uneven tone'],
      benefits: ['Brightening', 'Even tone', 'Fade dark spots'],
      ingredients: ['Licorice', 'Alpha Arbutin', 'Vitamin C']
    },
    glowing: {
      direct: ['Dullness', 'Glowing Skin'],
      benefits: ['Hydration', 'Radiance boosting', 'Glow', 'Instant freshness'],
      ingredients: ['Saffron', 'Honey']
    },
    pores: {
      direct: ['Open Pores', 'Large Pores', 'Uneven Texture'],
      benefits: ['Oil balancing', 'Tightening', 'Refining texture'],
      ingredients: ['Niacinamide', 'Salicylic']
    }
  };
  
  const c = CONCERN_MAP[concernId];
  if (!c) return false;

  const pConcerns = product.concerns || [];
  const pBenefits = product.benefits || [];
  const pIngredients = product.allIngredients || [];

  const hasDirect = pConcerns.some(pc => c.direct.some(k => pc.toLowerCase().includes(k.toLowerCase())));
  if (hasDirect) return true;

  const hasBenefit = pBenefits.some(pb => c.benefits.some(k => pb.toLowerCase().includes(k.toLowerCase())));
  if (hasBenefit) return true;

  const hasIng = pIngredients.some(pi => c.ingredients.some(k => pi.toLowerCase().includes(k.toLowerCase())));
  if (hasIng) return true;

  return false;
};

// ════════════════════════════════════════════════
// MAIN COLLECTION PAGE
// ════════════════════════════════════════════════
interface CollectionPageProps {
  onNavigateToProduct?: (index: number) => void;
  scrollY?: any;
  onViewChange?: (view: 'grid' | 'detail') => void;
  addToCart?: (p: ProductType) => void;
  initialProductId?: string;
  onCheckout?: (items: CartItem[], total: number) => void;
  initialConcern?: string | null;
  onClearConcern?: () => void;
}

export default function CollectionPage({ onNavigateToProduct, scrollY, onViewChange, addToCart, initialProductId, onCheckout, initialConcern, onClearConcern }: CollectionPageProps) {
  const [view, setView] = useState<'grid' | 'detail'>('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeConcern, setActiveConcern] = useState<string | null>(initialConcern || null);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [flyItems, setFlyItems] = useState<FlyItem[]>([]);
  const [liveProducts, setLiveProducts] = useState(COLLECTION_PRODUCTS);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const API_URL = (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) || 'http://localhost:3000';
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        if (data.products) {
          const merged = COLLECTION_PRODUCTS.map(cp => {
            const dbP = data.products.find((p: any) => p.id === cp.id || p.name.includes(cp.shortName));
            if (dbP) {
              return { 
                ...cp, 
                price: dbP.price || cp.price, 
                stock_message: dbP.stock_message, 
                priceDisplay: dbP.price ? `₹${dbP.price}.00` : cp.priceDisplay 
              };
            }
            return cp;
          });
          setLiveProducts(merged);
        }
      } catch (err) {
        console.warn('Failed to load live inventory:', err);
      }
    };
    fetchInventory();
  }, []);

  useEffect(() => {
    setActiveConcern(initialConcern || null);
  }, [initialConcern]);

  const handleAddToCart = useCallback((product: ProductType, startX?: number, startY?: number) => {
    // Launch fly animation
    const flyId = `${product.id}-${Date.now()}`;
    const sx = startX ?? SW / 2;
    const sy = startY ?? SH / 2;
    setFlyItems((prev) => [...prev, { id: flyId, image: product.image, startX: sx, startY: sy }]);
    // Actually add to cart
    addToCart?.(product);
  }, [addToCart]);

  const removeFlyItem = useCallback((id: string) => {
    setFlyItems((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClearConcern = useCallback(() => {
    setActiveConcern(null);
    onClearConcern?.();
  }, [onClearConcern]);

  const filteredProducts = liveProducts.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (activeConcern && !matchConcern(p, activeConcern)) return false;
    return true;
  });

  const openProduct = useCallback((product: ProductType) => {
    setSelectedProduct(product);
    setView('detail');
    onViewChange?.('detail');
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
  }, [onViewChange]);

  const goBack = useCallback(() => {
    setView('grid');
    onViewChange?.('grid');
    setSelectedProduct(null);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
  }, [onViewChange]);

  // Auto-open product if initialProductId provided (from homepage card click)
  useEffect(() => {
    if (initialProductId && liveProducts.length > 0) {
      const product = liveProducts.find(p => p.id === initialProductId);
      if (product) {
        setTimeout(() => openProduct(product as ProductType), 150);
      }
    }
  }, [initialProductId, liveProducts]);

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
            activeConcern={activeConcern}
            onClearConcern={handleClearConcern}
            products={filteredProducts}
            onSelectProduct={openProduct}
            onAddToCart={handleAddToCart}
            scrollY={scrollY}
          />
        )}

        {view === 'detail' && selectedProduct && (
          <ProductLandingPage
            product={selectedProduct}
            onBack={goBack}
            onAddToCart={handleAddToCart}
            allProducts={liveProducts}
            onSelectProduct={openProduct}
          />
        )}
      </Animated.ScrollView>

      {/* Sticky Bottom Bar (detail view only) */}
      {view === 'detail' && selectedProduct && (
        <StickyBottomBar product={selectedProduct} onAddToCart={handleAddToCart} />
      )}

      {/* Fly-to-cart animation overlay */}
      <FlyToCartOverlay items={flyItems} onComplete={removeFlyItem} />
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
    backgroundColor: GOLD_DEEP, justifyContent: 'center', alignItems: 'center',
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
  activeConcernHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(233,195,73,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(233,195,73,0.15)',
    marginBottom: 10,
    marginTop: -10,
  },
  activeConcernText: {
    fontSize: 14,
    color: '#1A1A1A',
    ...Platform.select({ web: { fontFamily: 'Georgia, serif' } as any }),
  },
  clearConcernBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  clearConcernText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  splashHeroContainer: {
    width: '100%',
    height: SH, // 100vh cinematic height matching viewport
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
    top: '40%', // Positioned elegantly
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  glassBackdrop: {
    paddingVertical: 44,
    paddingHorizontal: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    ...Platform.select({ web: { backdropFilter: 'blur(24px)', boxShadow: '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 60px rgba(233,195,73,0.06)' } as any }),
  },
  lightReflectionLayer: {
    backgroundColor: 'rgba(233, 195, 73, 0.04)',
    ...Platform.select({ web: { filter: 'blur(60px)', background: 'radial-gradient(circle at 60% 40%, rgba(233, 195, 73, 0.08) 0%, transparent 60%)' } as any }),
  },
  splashOverline: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 12, // High fashion editorial spacing
    marginBottom: 20,
    textAlign: 'center',
  },
  splashTitle: {
    color: '#ffffff',
    fontSize: Platform.OS === 'web' && SW > 768 ? 58 : 36, // Slightly larger elegant
    fontWeight: '300',
    letterSpacing: 8, // Wider letter spacing for high fashion look
    textAlign: 'center',
    marginBottom: 24,
    ...Platform.select({ web: { fontFamily: SERIF, textShadow: '0 2px 20px rgba(233,195,73,0.2)' } as any }),
  },
  splashSubtitle: {
    color: '#d9e5e4',
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 1,
    lineHeight: 28,
    textAlign: 'center',
    maxWidth: 500,
  },

  hero: {
    width: '100%', alignItems: 'center',
    paddingVertical: 60, // Increased for breathable empty space
    paddingHorizontal: 40,
  },
  heroInner: { alignItems: 'center', marginVertical: 20 },
  heroGoldLine: {
    width: 80, height: 1, backgroundColor: GOLD_HIGHLIGHT, // Thinner, more elegant
    marginVertical: 20, borderRadius: 1,
  },
  heroLabel: {
    color: GOLD_DEEP, fontSize: 14, fontWeight: '500',
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
    gap: 12, marginTop: 35, marginBottom: 20
  },
  categoryBtn: {
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 28,
    backgroundColor: GLASS_BG_STRONG,
    borderWidth: 1, borderColor: GLASS_BORDER,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)'
      } as any
    }),
  },
  categoryBtnHovered: {
    ...Platform.select({
      web: {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 24px rgba(212,175,55,0.12), inset 0 1px 0 rgba(255,255,255,0.9)'
      } as any
    }),
    borderColor: GLASS_BORDER_GOLD,
  },
  categoryBtnActive: {
    backgroundColor: GOLD_LIGHT,
    borderColor: GLASS_BORDER_GOLD,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(212,175,55,0.20), 0 0 12px rgba(255,215,0,0.08)'
      } as any
    }),
  },
  categoryBtnText: {
    color: TEXT_MUTED, fontSize: 11, fontWeight: '500', letterSpacing: 2,
  },
  categoryBtnTextActive: { color: GOLD_DEEP, fontWeight: '700' },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 40, maxWidth: 1300,
    alignSelf: 'center', width: '100%', marginTop: 30, marginBottom: 60,
  },
  card: {
    width: 290, backgroundColor: GLASS_BG_STRONG, overflow: 'visible',
    borderWidth: 1, borderColor: GLASS_BORDER,
    borderRadius: 24,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
      } as any
    }),
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 30, elevation: 4,
  },
  cardHovered: {
    ...Platform.select({
      web: {
        boxShadow: '0 20px 48px rgba(0,0,0,0.08), 0 0 24px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
        transform: 'translateY(-6px) scale(1.02)',
        borderColor: GLASS_BORDER_GOLD,
      } as any
    }),
  },
  cardImageArea: {
    height: 320, justifyContent: 'center', alignItems: 'center',
    borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden'
  },
  cardImage: { width: '100%', height: '100%' },
  ratingBadge: {
    position: 'absolute', top: 14, left: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: GLASS_BORDER,
    ...Platform.select({ web: { backdropFilter: 'blur(16px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' } as any }),
  },
  ratingBadgeText: {
    color: TEXT_PRIMARY, fontSize: 13, fontWeight: '700', letterSpacing: 0.5,
  },
  cardInfo: {
    padding: 24, alignItems: 'center',
  },
  cardSubtitle: {
    color: GOLD_DEEP, fontSize: 10, fontWeight: '600',
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
  resetText: { color: GOLD_DEEP, fontSize: 14, fontWeight: '500', textDecorationLine: 'underline' },

  trustSection: {
    width: '100%', paddingVertical: 60, paddingHorizontal: 40,
    marginTop: 40, backgroundColor: CREAM_WARM,
    borderTopWidth: 0, borderBottomWidth: 0,
  },
  trustRow: {
    flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 24,
    maxWidth: 1000, alignSelf: 'center',
  },
  trustItem: {
    alignItems: 'center', width: 180,
    backgroundColor: GLASS_BG_STRONG,
    borderRadius: 20, borderWidth: 1, borderColor: GLASS_BORDER,
    paddingVertical: 24, paddingHorizontal: 16,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      } as any,
    }),
  },
  trustItemTitle: {
    color: TEXT_PRIMARY, fontSize: 13, fontWeight: '600',
    letterSpacing: 1, marginTop: 12, textAlign: 'center',
  },
  trustItemSub: {
    color: TEXT_MUTED, fontSize: 11, marginTop: 4, textAlign: 'center',
  },

  footer: {
    alignItems: 'center', paddingVertical: 40, paddingHorizontal: 40,
  },
  footerLine: { width: 40, height: 1, backgroundColor: GOLD_HIGHLIGHT, marginVertical: 14, opacity: 0.5 },
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
    zIndex: 100, // Ensure breadcrumbs are clickable above other ambient elements
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
    overflow: 'hidden', borderRadius: 8,
  },
  heroImage: { width: '100%', height: '100%' },
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
  trustBadges: { gap: 10, marginTop: 20 },
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
    overflow: 'hidden',
  },
  storyImage: { width: '100%', height: '100%' },
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
    color: GOLD_DEEP, fontSize: 14, fontWeight: '400', letterSpacing: 1, marginTop: 2,
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
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: GLASS_BORDER,
    borderRadius: 20, backgroundColor: GLASS_BG,
    ...Platform.select({ web: { backdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)' } as any }),
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
    padding: 28, backgroundColor: GLASS_BG_STRONG,
    borderWidth: 1, borderColor: GLASS_BORDER,
    borderRadius: 20,
    ...Platform.select({ web: { backdropFilter: 'blur(16px)', boxShadow: '0 6px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)' } as any }),
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
    backgroundColor: GLASS_BG_STRONG, borderTopWidth: 1, borderColor: GLASS_BORDER,
    paddingVertical: 12, paddingHorizontal: 30, zIndex: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 5,
    ...Platform.select({ web: { backdropFilter: 'blur(24px)', boxShadow: '0 -4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)' } as any }),
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
    borderWidth: 1.5, borderColor: GOLD_DEEP, borderRadius: 24,
    paddingVertical: 12, paddingHorizontal: 28,
    backgroundColor: GOLD_LIGHT,
    ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 12px rgba(212,175,55,0.15)' } as any }),
  },
  cartBtnText: {
    color: GOLD_DEEP, fontSize: 12, fontWeight: '700', letterSpacing: 2,
  },
});

// ════════════════════════════════════════════════
// STYLES: CART DRAWER
// ════════════════════════════════════════════════
const DRAWER_WIDTH = isMobileSS ? SW : Math.min(420, SW * 0.9);

const cart = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999,
    flexDirection: 'row', justifyContent: 'flex-end',
    pointerEvents: 'box-none' as any,
  },
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%' as any,
    backgroundColor: '#F8F8FB',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: -12, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 20,
    ...Platform.select({ web: { boxShadow: '-16px 0 60px rgba(0,0,0,0.18)' } as any }),
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 28, paddingTop: Platform.OS === 'web' ? 36 : 56, paddingBottom: 20,
    backgroundColor: '#F8F8FB',
  },
  headerTitle: {
    fontSize: 22, fontWeight: '700', color: '#1A1A1A', letterSpacing: 0.3,
    ...Platform.select({ web: { fontFamily: 'Georgia, serif' } as any }),
  },
  headerSubtitle: {
    fontSize: 13, color: '#888', marginTop: 3, fontWeight: '400',
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.07)',
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  divider: {
    height: 1, backgroundColor: '#E8E8EE', marginHorizontal: 0,
  },
  list: { flex: 1 },

  // Empty state
  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 20, fontWeight: '600', color: '#555', marginBottom: 8,
    ...Platform.select({ web: { fontFamily: 'Georgia, serif' } as any }),
  },
  emptySubtext: {
    fontSize: 14, color: '#AAA', textAlign: 'center', lineHeight: 22, marginBottom: 36,
  },
  exploreBtn: {
    backgroundColor: '#C9A227',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 48,
    width: '100%' as any,
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.3s ease' } as any }),
  },
  exploreBtnText: {
    color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.5,
  },

  // Cart items
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    marginHorizontal: 20, marginVertical: 12,
    padding: 14, backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  itemImgWrap: {
    width: 72, height: 72, borderRadius: 14, backgroundColor: '#F5F5F7',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  itemImg: { width: 60, height: 60 },
  itemInfo: { flex: 1 },
  itemName: { color: '#1A1A1A', fontSize: 14, fontWeight: '700', letterSpacing: 0.2, marginBottom: 3 },
  itemSize: { color: '#999', fontSize: 11, marginBottom: 4 },
  itemPrice: { color: '#B8962E', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  removeBtn: {
    padding: 4,
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },

  // Qty controls
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 0, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, overflow: 'hidden' },
  qtyBtn: {
    width: 34, height: 34, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F5F7',
    ...Platform.select({ web: { cursor: 'pointer', transition: 'background 0.15s' } as any }),
  },
  qtyBtnText: { color: '#1A1A1A', fontSize: 16, fontWeight: '600', lineHeight: 18 },
  qtyText: { color: '#1A1A1A', fontSize: 14, fontWeight: '700', minWidth: 32, textAlign: 'center' },

  // Footer
  footer: {
    padding: 24, paddingBottom: Platform.OS === 'web' ? 28 : 40,
    backgroundColor: '#F8F8FB',
    borderTopWidth: 1, borderColor: '#E8E8EE',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  totalLabel: { color: '#888', fontSize: 13, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' },
  totalValue: { color: '#1A1A1A', fontSize: 22, fontWeight: '800' },
  taxNote: { color: '#AAA', fontSize: 11, marginBottom: 20, letterSpacing: 0.2 },
  checkoutBtn: {
    borderRadius: 16, overflow: 'hidden',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  checkoutGradient: {
    paddingVertical: 18, alignItems: 'center', borderRadius: 16,
  },
  checkoutText: { color: '#1A1A1A', fontSize: 13, fontWeight: '800', letterSpacing: 3 },
});
