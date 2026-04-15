import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Truck, CheckCircle2, ChevronLeft, LogOut, ExternalLink } from 'lucide-react-native';

const GOLD = '#C9A227';
const TEXT = '#1A1A1A';

export default function ProfilePage({ userEmail, onLogout, onBack }: { userEmail: string, onLogout: () => void, onBack: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { supabaseClient } = require('./lib/supabaseClient');
      const { data: { session } } = await supabaseClient.auth.getSession();
      const token = session?.access_token || '';

      const API_URL = (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) || '';
      const res = await fetch(`${API_URL}/api/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch(e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') return <CheckCircle2 color="#3C7A3C" size={24} />;
    if (status === 'shipped') return <Truck color="#2A75D3" size={24} />;
    return <Package color={GOLD} size={24} />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return '#3C7A3C';
    if (status === 'shipped') return '#2A75D3';
    return GOLD;
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={['#FDFBF7', '#FAF8F3']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={s.backBtn}>
          <ChevronLeft color={TEXT} size={22} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={onLogout} style={s.logoutBtn}>
          <LogOut color="rgba(26,26,26,0.6)" size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <View style={s.profileCard}>
          <LinearGradient colors={['#110C07', '#1A130B']} style={StyleSheet.absoluteFill} />
          <View style={s.avatar}>
            <Text style={s.avatarText}>{userEmail.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.emailText}>{userEmail}</Text>
          <Text style={s.memberText}>Daluxe Member</Text>
        </View>

        <Text style={s.sectionTitle}>Order History</Text>
        
        {loading ? (
          <ActivityIndicator color={GOLD} size="large" style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <View style={s.emptyState}>
            <Package color="rgba(26,26,26,0.2)" size={48} />
            <Text style={s.emptyText}>You haven't placed any orders yet.</Text>
            <TouchableOpacity onPress={onBack}>
              <Text style={s.shopLink}>Start Shopping →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order, idx) => (
            <View key={order.id || idx} style={s.orderCard}>
              <View style={s.orderHeader}>
                <View>
                  <Text style={s.orderNumber}>{order.order_number}</Text>
                  <Text style={s.orderDate}>{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
                <Text style={s.orderTotal}>₹{order.total_amount}</Text>
              </View>

              <View style={s.orderStatusBox}>
                {getStatusIcon(order.status)}
                <View style={{ flex: 1 }}>
                  <Text style={[s.statusText, { color: getStatusColor(order.status) }]}>{order.status.toUpperCase()}</Text>
                  {order.tracking_url ? (
                    <TouchableOpacity onPress={() => window.open(order.tracking_url, '_blank')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Text style={s.trackingLink}>Track via Shiprocket</Text>
                      <ExternalLink size={12} color={GOLD} />
                    </TouchableOpacity>
                  ) : order.shiprocket_order_id ? (
                    <Text style={s.trackingSub}>Tracking pending allocation</Text>
                  ) : (
                    <Text style={s.trackingSub}>Order received & processing</Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 52 : Platform.OS === 'web' ? 24 : 20,
    paddingBottom: 16, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  backBtn: { padding: 6 },
  logoutBtn: { padding: 6, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 20 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT, letterSpacing: 0.8 },
  
  profileCard: {
    padding: 30, borderRadius: 24, alignItems: 'center', overflow: 'hidden', marginBottom: 32,
    ...Platform.select({ web: { boxShadow: '0 10px 30px rgba(0,0,0,0.15)' } as any })
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(201,162,39,0.15)', borderWidth: 1, borderColor: 'rgba(201,162,39,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 24, fontWeight: '300', color: GOLD, ...Platform.select({ web: { fontFamily: 'Georgia, serif' } as any }) },
  emailText: { fontSize: 16, color: '#FFFFFF', fontWeight: '500', marginBottom: 6 },
  memberText: { fontSize: 11, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '600' },

  sectionTitle: { fontSize: 18, fontWeight: '300', color: TEXT, marginBottom: 16, letterSpacing: 1, ...Platform.select({ web: { fontFamily: 'Georgia, serif' } as any }) },
  
  orderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', ...Platform.select({ web: { boxShadow: '0 4px 12px rgba(0,0,0,0.03)' } as any }) },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.06)', marginBottom: 16 },
  orderNumber: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 4 },
  orderDate: { fontSize: 12, color: 'rgba(26,26,26,0.5)' },
  orderTotal: { fontSize: 15, fontWeight: '800', color: TEXT },

  orderStatusBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(0,0,0,0.02)', padding: 14, borderRadius: 12 },
  statusText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  trackingLink: { fontSize: 12, color: GOLD, fontWeight: '600', textDecorationLine: 'underline' },
  trackingSub: { fontSize: 11, color: 'rgba(26,26,26,0.5)', marginTop: 4 },

  emptyState: { alignItems: 'center', paddingVertical: 60, opacity: 0.8 },
  emptyText: { marginTop: 16, fontSize: 14, color: 'rgba(26,26,26,0.5)', marginBottom: 12 },
  shopLink: { color: GOLD, fontSize: 13, fontWeight: '700', letterSpacing: 1 }
});
