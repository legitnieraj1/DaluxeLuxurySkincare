import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Star, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLLECTION_PRODUCTS, ProductType } from './CollectionPage';
import LuxuryMarquee from './LuxuryMarquee';
import { Footer } from './Footer';

const { width } = Dimensions.get('window');

// Hook to detect mobile width
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(width < 768);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(Dimensions.get('window').width < 768);
    if (Platform.OS === 'web') window.addEventListener('resize', handleResize);
    return () => {
      if (Platform.OS === 'web') window.removeEventListener('resize', handleResize);
    };
  }, []);
  return isMobile;
};

// --------------------------------------------------------------------------
// 1. SHOP BY CONCERN
// --------------------------------------------------------------------------
const CONCERNS = [
  { id: 'acne', label: 'Acne Marks', img: require('./assets/acne.png') },
  { id: 'pigmentation', label: 'Pigmentation', img: require('./assets/pigmentation.png') },
  { id: 'glowing', label: 'Glowing Skin', img: require('./assets/glowskin.png') },
  { id: 'pores', label: 'Open Pores', img: require('./assets/openpores.png') },
];

const ShopByConcern = ({ onConcernClick }: any) => {
  const isMobile = useIsMobile();
  return (
    <View style={[styles.section, { backgroundColor: '#F8F6F0' }]}>
      <Text style={styles.sectionTitle}>Shop by Concern</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.concernRow, !isMobile && { justifyContent: 'center', flexGrow: 1 }]} style={{ width: '100%' }}>
        {CONCERNS.map(c => (
          <TouchableOpacity key={c.id} style={styles.concernItem} onPress={() => onConcernClick && onConcernClick(c.id)}>
            <Image source={c.img} style={styles.concernImg} />
            <Text style={styles.concernLabel}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// --------------------------------------------------------------------------
// 2. PRODUCT CARDS & CAROUSELS (Best Sellers, Face Serums, etc.)
// --------------------------------------------------------------------------
const ProductCard = ({ product, onPurchase, onClick }: any) => {
  const isMobile = useIsMobile();
  return (
    <View style={cardStyles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => onClick && onClick(product)} style={[cardStyles.imageArea, isMobile && { height: 200 }]}>
         <Image source={product.image} style={cardStyles.image} resizeMode="contain" />
         {product.rating >= 4.5 && (
            <View style={cardStyles.ratingBadge}>
              <Star color="#FFD700" size={12} fill="#FFD700" />
              <Text style={cardStyles.ratingText}>{product.rating}</Text>
            </View>
         )}
      </TouchableOpacity>
      <View style={cardStyles.info}>
         <Text style={cardStyles.subtitle}>{product.subtitle}</Text>
         <Text style={cardStyles.name} numberOfLines={1}>{product.shortName}</Text>
         <Text style={cardStyles.price}>{product.priceDisplay}</Text>
         
         <TouchableOpacity style={{ marginTop: 16, width: '100%', borderRadius: 24, overflow: 'hidden', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }} onPress={() => onPurchase(product)}>
           <LinearGradient colors={['#FCEE21', '#FFD700', '#F39C12']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={{ paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center' }}>
             <Text style={cardStyles.buyBtnText}>ADD TO CART</Text>
           </LinearGradient>
         </TouchableOpacity>
      </View>
    </View>
  );
};

const ProductCarouselSection = ({ title, products, onAddToCart, onProductClick, tabs = [] }: any) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(tabs[0] || '');

  return (
    <View style={[styles.section, { backgroundColor: '#FDFBF7' }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      
      {tabs.length > 0 && (
        <View style={styles.tabsRow}>
          {tabs.map((tab: string) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[isMobile ? styles.scrollMob : styles.scrollDesk, products.length <= 2 && { justifyContent: 'center' }]} style={{ width: '100%' }}>
        {products.map((p: any) => (
          <ProductCard key={`${title}-${p.id}`} product={p} onPurchase={onAddToCart} onClick={onProductClick} />
        ))}
      </ScrollView>
    </View>
  );
};

// --------------------------------------------------------------------------
// 3. AI SKIN ASSESSMENT
// --------------------------------------------------------------------------
const SkinAssessment = ({ onStartScan }: any) => {
  return (
    <View style={aiStyles.container}>
      <LinearGradient colors={['#0F2F46', '#0B1D2A']} style={aiStyles.gradient}>
        
        {/* Banner content layout */}
        <View style={aiStyles.row}>
          {/* Left Text */}
          <View style={aiStyles.textCol}>
            <Text style={aiStyles.badge}>✨ NEW</Text>
            <Text style={aiStyles.headline}>Unveil your skin’s secrets</Text>
            <Text style={aiStyles.subtext}>AI-Powered analysis in 2 minutes. Completely FREE.</Text>
            <TouchableOpacity style={aiStyles.ctaBtn} onPress={onStartScan}>
              <Text style={aiStyles.ctaText}>Start Scan</Text>
              <ArrowRight color="#0B1D2A" size={16} />
            </TouchableOpacity>
          </View>
          
          {/* Right Image/Visual */}
          <View style={aiStyles.visCol}>
             <View style={aiStyles.faceRound}>
               <Image source={require('./assets/splash_hero.jpg')} style={{ width: '100%', height: '100%' }} />
             </View>
          </View>
        </View>

      </LinearGradient>
    </View>
  );
};

// --------------------------------------------------------------------------
// 4. CAMPAIGN BANNERS
// --------------------------------------------------------------------------
const CampaignBanners = ({ onNavigate }: any) => {
  const isMobile = useIsMobile();
  return (
    <View style={[styles.section, { backgroundColor: '#F8F6F0' }]}>
      <View style={[promoStyles.grid, isMobile && { flexDirection: 'column' }]}>
        <TouchableOpacity style={promoStyles.banner} activeOpacity={0.9} onPress={() => onNavigate && onNavigate('Collection')}>
           <LinearGradient colors={['#E5F5F3', '#C6EBE5']} style={promoStyles.bg}>
              <Text style={promoStyles.tag}>HYDROSOL INFUSION</Text>
              <Text style={promoStyles.desc}>Gentle floral waters like Rose Hydrosol calm, hydrate, and restore skin balance without irritation.</Text>
              <Text style={promoStyles.link}>Shop Now →</Text>
           </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={promoStyles.banner} activeOpacity={0.9} onPress={() => onNavigate && onNavigate('Collection')}>
           <LinearGradient colors={['#F5E6F3', '#E9C6E5']} style={promoStyles.bg}>
              <Text style={promoStyles.tag}>AYURVEDIC HERBS</Text>
              <Text style={promoStyles.desc}>Saffron, Manjistha, Neem, and Tulsi work together to purify, brighten, and enhance natural glow.</Text>
              <Text style={promoStyles.link}>Shop Now →</Text>
           </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={promoStyles.banner} activeOpacity={0.9} onPress={() => onNavigate && onNavigate('Collection')}>
           <LinearGradient colors={['#EAE6F5', '#CDC6E5']} style={promoStyles.bg}>
              <Text style={promoStyles.tag}>BOTANICAL ACTIVES</Text>
              <Text style={promoStyles.desc}>Licorice, Alpha Arbutin, and Vitamin C help reduce pigmentation and even out skin tone gently.</Text>
              <Text style={promoStyles.link}>Shop Now →</Text>
           </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={promoStyles.banner} activeOpacity={0.9} onPress={() => onNavigate && onNavigate('Collection')}>
           <LinearGradient colors={['#E6F5ED', '#C6EBE1']} style={promoStyles.bg}>
              <Text style={promoStyles.tag}>BARRIER + HYDRATION</Text>
              <Text style={promoStyles.desc}>Aloe Vera, Panthenol, Sodium Hyaluronate, and Gotu Kola deeply hydrate and strengthen skin barrier.</Text>
              <Text style={promoStyles.link}>Shop Now →</Text>
           </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --------------------------------------------------------------------------
// 5. FEATURED IN & REVIEWS
// --------------------------------------------------------------------------
const FeaturedIn = () => (
  <View style={featStyles.container}>
    <Text style={featStyles.title}>FEATURED IN</Text>
    <View style={featStyles.row}>
       <Text style={featStyles.logoText}>VOGUE</Text>
       <Text style={featStyles.logoText}>GQ</Text>
       <Text style={featStyles.logoText}>ELLE</Text>
       <Text style={featStyles.logoText}>FEMINA</Text>
    </View>
  </View>
);

const REVIEWS = [
  { id: 1, name: 'Sarah J.', text: '"The most luxurious skincare I have ever used. My skin feels deeply hydrated and glowing."', rating: 5 },
  { id: 2, name: 'Priya M.', text: '"Absolutely in love with the Hydrosol Infusion. It calmed my skin in just two days!"', rating: 5 },
  { id: 3, name: 'Emily R.', text: '"The botanical actives worked wonders for my pigmentation. Highly recommend!"', rating: 5 },
  { id: 4, name: 'Anita K.', text: '"A premium experience from the packaging to the actual product. My daily go-to now."', rating: 5 },
  { id: 5, name: 'Chloe T.', text: '"Truly transformative. My skin has never looked so clear and radiant before using these."', rating: 5 },
];

const ReviewCard = ({ review }: any) => (
  <View style={reviewStyles.card}>
    <LinearGradient colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.2)']} style={reviewStyles.glassInner}>
      <View style={{ flexDirection: 'row', gap: 2, marginBottom: 12 }}>
        {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} color="#D4AF37" fill="#D4AF37" />)}
      </View>
      <Text style={reviewStyles.quote}>{review.text}</Text>
      <Text style={reviewStyles.author}>- {review.name} <CheckCircle2 size={14} color="#2E7D32" style={{ marginLeft: 4 }} /></Text>
    </LinearGradient>
  </View>
);

const ReviewsSection = () => {
  const isMobile = useIsMobile();
  return (
    <View style={reviewStyles.container}>
      <Text style={styles.sectionTitle}>Real People. Real Results.</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        snapToInterval={isMobile ? 300 : 360}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 20, paddingHorizontal: 40, paddingBottom: 40 }} 
        style={{ width: '100%' }}
      >
         {REVIEWS.map((r) => <ReviewCard key={r.id} review={r} />)}
      </ScrollView>
    </View>
  );
};



// --------------------------------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------------------------------
export default function HomeSections({ onAddToCart, onProductClick, onStartScan, onConcernClick, onNavigate }: any) {
  // Use existing COLLECTION_PRODUCTS for categories
  const faceSerums = COLLECTION_PRODUCTS.filter(p => p.category === 'serum' || p.category === 'facewash');
  const moisturizers = COLLECTION_PRODUCTS.filter(p => p.category !== 'facewash');
  const combos = COLLECTION_PRODUCTS;

  return (
    <View style={[{ width: '100%', backgroundColor: '#F8F6F0' }, Platform.OS === 'web' ? { overflowX: 'hidden' } as any : { overflow: 'hidden' }]}>
      <ShopByConcern onConcernClick={onConcernClick} />
      <ProductCarouselSection title="Our Most Loved Products" products={COLLECTION_PRODUCTS} tabs={['Bestsellers', 'New Launches']} onAddToCart={onAddToCart} onProductClick={onProductClick} />
      <SkinAssessment onStartScan={onStartScan} />
      <LuxuryMarquee />
      <CampaignBanners onNavigate={onNavigate} />
      <ProductCarouselSection title="Moisturizers & Creams" products={moisturizers} onAddToCart={onAddToCart} onProductClick={onProductClick} />
      <ReviewsSection />
      <Footer onNavigate={onNavigate} />
    </View>
  );
}

// --------------------------------------------------------------------------
// STYLES
// --------------------------------------------------------------------------
const styles = StyleSheet.create({
  section: { paddingVertical: 60, width: '100%', alignItems: 'center' },
  sectionTitle: { fontSize: 32, fontWeight: '300', marginBottom: 40, textAlign: 'center', color: '#1A1A1A', ...Platform.select({ web: { fontFamily: 'Georgia, serif' } as any }) },
  concernRow: { paddingHorizontal: 40, gap: 40, alignItems: 'center' },
  concernItem: { alignItems: 'center' },
  concernImg: { width: 90, height: 90, borderRadius: 45, marginBottom: 12, borderWidth: 2, borderColor: '#D4AF37' },
  concernLabel: { fontSize: 13, fontWeight: '500', color: '#1A1A1A' },
  
  tabsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 40 },
  tab: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: 'transparent' },
  tabActive: { borderColor: '#E9C349', backgroundColor: '#FDFBF7' },
  tabText: { fontSize: 13, color: 'rgba(26,26,26,0.5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  tabTextActive: { color: '#B8962E', fontWeight: '700' },
  
  scrollMob: { paddingHorizontal: 20, gap: 20 },
  scrollDesk: { paddingHorizontal: 40, gap: 24, justifyContent: 'center', minWidth: '100%' },
});

const cardStyles = StyleSheet.create({
  container: { width: 260, backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: '#EAEAEA', overflow: 'hidden', padding: 16 },
  imageArea: { height: 220, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F8F8', borderRadius: 16, marginBottom: 16 },
  image: { width: '90%', height: '90%' },
  ratingBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  info: { alignItems: 'center' },
  subtitle: { fontSize: 10, fontWeight: '600', color: '#B8962E', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', letterSpacing: 1, marginBottom: 8 },
  price: { fontSize: 15, fontWeight: '400', color: '#1A1A1A' },
  buyBtnText: { color: '#0B1D2A', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
});

const aiStyles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center', backgroundColor: '#F8F6F0' },
  gradient: { width: '100%', maxWidth: 1200, borderRadius: 30, overflow: 'hidden' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: 40 },
  textCol: { flex: 1, minWidth: 280, gap: 16 },
  badge: { color: '#D4AF37', fontWeight: '800', letterSpacing: 2 },
  headline: { fontSize: 32, fontWeight: '300', color: '#FFF', ...Platform.select({ web: { fontFamily: 'Georgia, serif' } as any }) },
  subtext: { color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 24, maxWidth: 350 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FFF', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30, gap: 12, marginTop: 10 },
  ctaText: { color: '#0F2F46', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  visCol: { flex: 1, minWidth: 280, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  faceRound: { width: 180, height: 180, borderRadius: 90, borderWidth: 3, borderColor: 'rgba(212,175,55,0.4)', overflow: 'hidden' },
});

const promoStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, justifyContent: 'center', maxWidth: 1200, paddingHorizontal: 20 },
  banner: { width: '45%', minWidth: 300, height: 160, borderRadius: 24, overflow: 'hidden' },
  bg: { flex: 1, padding: 30, justifyContent: 'center' },
  tag: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', letterSpacing: 2, marginBottom: 8 },
  desc: { fontSize: 13, color: 'rgba(26,26,26,0.7)', marginBottom: 16, maxWidth: 200 },
  link: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
});

const featStyles = StyleSheet.create({
  container: { paddingVertical: 60, width: '100%', alignItems: 'center', backgroundColor: '#FFF', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#EEE' },
  title: { fontSize: 12, fontWeight: '600', color: '#888', letterSpacing: 3, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 40, flexWrap: 'wrap', justifyContent: 'center' },
  logoText: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', letterSpacing: 1 },
});

const reviewStyles = StyleSheet.create({
  container: { paddingVertical: 80, width: '100%', backgroundColor: '#FDFBF7' },
  card: { 
    width: Platform.OS === 'web' && width > 768 ? 340 : 280, 
    borderRadius: 24, 
    overflow: 'hidden',
    borderWidth: 1.5, 
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
      } as any,
    }),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassInner: {
    padding: 24,
    flex: 1,
  },
  quote: { fontSize: 15, fontStyle: 'italic', color: '#444', lineHeight: 24, marginBottom: 20 },
  author: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', flexDirection: 'row', alignItems: 'center' },
});
