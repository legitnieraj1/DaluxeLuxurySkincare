import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export type StockStatus = 'instock' | 'low' | 'outofstock';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ProductImage { id: string; url: string; isMain: boolean; }

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  price: number;
  discount: number;
  discountType: 'percent' | 'flat';
  stock: number;
  stockStatus: StockStatus;
  images: ProductImage[];
  ingredients: string[];
  benefits: string[];
  skinConcern: string;
  howToUse: string;
  suitableFor: string;
  texture: string;
  fragrance: string;
  isActive: boolean;
  isBestSeller: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentId: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  joinedAt: string;
}

// ─────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────

const seedProducts: Product[] = [
  {
    id: '1', name: 'Radiance Renewal Serum', tagline: 'Illuminates & revitalizes dull skin',
    description: 'A potent vitamin C serum with niacinamide to brighten and even skin tone.',
    category: 'Face Serum', price: 1299, discount: 10, discountType: 'percent',
    stock: 84, stockStatus: 'instock', images: [], ingredients: ['Vitamin C', 'Niacinamide', 'Hyaluronic Acid'],
    benefits: ['Brightens skin', 'Reduces dark spots', 'Deep hydration'],
    skinConcern: 'Dullness, Pigmentation', howToUse: 'Apply 2-3 drops on cleansed face morning and night.',
    suitableFor: 'All skin types', texture: 'Lightweight fluid', fragrance: 'Fragrance-free',
    isActive: true, isBestSeller: true, createdAt: new Date().toISOString()
  },
  {
    id: '2', name: 'Barrier Ceramide Moisturizer', tagline: 'Restores & fortifies skin barrier',
    description: 'Rich ceramide cream that repairs the moisture barrier and soothes sensitive skin.',
    category: 'Moisturizer', price: 1599, discount: 0, discountType: 'percent',
    stock: 3, stockStatus: 'low', images: [], ingredients: ['Ceramide NP', 'Ceramide AP', 'Cholesterol'],
    benefits: ['Locks moisture', 'Reduces redness', 'Strengthens barrier'],
    skinConcern: 'Dryness, Sensitivity', howToUse: 'Apply on face and neck after serum.',
    suitableFor: 'Dry & Sensitive skin', texture: 'Rich cream', fragrance: 'Lightly floral',
    isActive: true, isBestSeller: false, createdAt: new Date().toISOString()
  },
  {
    id: '3', name: 'Botanical Gentle Cleanser', tagline: 'Clean without compromise',
    description: 'A pH-balanced gel cleanser that removes impurities without stripping natural oils.',
    category: 'Facewash', price: 799, discount: 50, discountType: 'flat',
    stock: 0, stockStatus: 'outofstock', images: [], ingredients: ['Aloe Vera', 'Green Tea Extract', 'Glycerin'],
    benefits: ['Removes impurities', 'Maintains pH balance', 'Hydrates while cleansing'],
    skinConcern: 'All concerns', howToUse: 'Lather on wet face, massage, rinse thoroughly.',
    suitableFor: 'All skin types', texture: 'Gel', fragrance: 'Light botanical',
    isActive: false, isBestSeller: false, createdAt: new Date().toISOString()
  }
];

const seedOrders: Order[] = [
  {
    id: '1', orderNumber: 'DAL-1001', customer: 'Aanya Sharma',
    email: 'aanya@email.com', phone: '+91 98765 43210', address: '12 Rose Garden, Sector 21',
    city: 'New Delhi', pincode: '110001',
    items: [{ productId: '1', productName: 'Radiance Renewal Serum', quantity: 2, price: 1299 }],
    total: 2598, status: 'pending', paymentId: 'pay_xyz001', createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2', orderNumber: 'DAL-1002', customer: 'Vikram Mehta',
    email: 'vikram@email.com', phone: '+91 87654 32109', address: '5 Marine Drive, Flat 3B',
    city: 'Mumbai', pincode: '400001',
    items: [{ productId: '2', productName: 'Barrier Ceramide Moisturizer', quantity: 1, price: 1599 }],
    total: 1599, status: 'shipped', paymentId: 'pay_xyz002', createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3', orderNumber: 'DAL-1003', customer: 'Priya Kapoor',
    email: 'priya@email.com', phone: '+91 76543 21098', address: 'Block C, Palm Heights',
    city: 'Bengaluru', pincode: '560001',
    items: [
      { productId: '1', productName: 'Radiance Renewal Serum', quantity: 1, price: 1299 },
      { productId: '3', productName: 'Botanical Gentle Cleanser', quantity: 1, price: 749 }
    ],
    total: 2048, status: 'delivered', paymentId: 'pay_xyz003', createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '4', orderNumber: 'DAL-1004', customer: 'Rohan Das',
    email: 'rohan@email.com', phone: '+91 65432 10987', address: '8A Elgin Road',
    city: 'Kolkata', pincode: '700001',
    items: [{ productId: '2', productName: 'Barrier Ceramide Moisturizer', quantity: 2, price: 1599 }],
    total: 3198, status: 'confirmed', paymentId: 'pay_xyz004', createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

const seedCustomers: Customer[] = [
  { id: '1', name: 'Aanya Sharma', email: 'aanya@email.com', phone: '+91 98765 43210', orderCount: 3, totalSpent: 7890, joinedAt: '2025-01-10' },
  { id: '2', name: 'Vikram Mehta', email: 'vikram@email.com', phone: '+91 87654 32109', orderCount: 1, totalSpent: 1599, joinedAt: '2025-03-02' },
  { id: '3', name: 'Priya Kapoor', email: 'priya@email.com', phone: '+91 76543 21098', orderCount: 5, totalSpent: 12400, joinedAt: '2024-11-15' },
  { id: '4', name: 'Rohan Das', email: 'rohan@email.com', phone: '+91 65432 10987', orderCount: 2, totalSpent: 5200, joinedAt: '2025-02-20' }
];

// ─────────────────────────────────────────
// STORE
// ─────────────────────────────────────────

interface AdminStore {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  // Product Actions
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Order Actions
  addOrder: (o: Omit<Order, 'id'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      products: seedProducts,
      orders: seedOrders,
      customers: seedCustomers,

      addProduct: (p) => set((state) => ({
        products: [
          { ...p, id: Date.now().toString(), createdAt: new Date().toISOString() },
          ...state.products
        ]
      })),

      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),

      addOrder: (o) => set((state) => ({
        orders: [{ ...o, id: Date.now().toString() }, ...state.orders]
      })),

      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map((o) => o.id === id ? { ...o, status } : o)
      })),
    }),
    { name: 'daluxe-admin-store' }
  )
);

// Helper to compute stock status
export const getStockStatus = (stock: number): StockStatus => {
  if (stock === 0) return 'outofstock';
  if (stock <= 5) return 'low';
  return 'instock';
};
