import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Address, CartItem, Product, WishlistItem, Order, OrderStatus, Coupon } from '../types';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_USER } from '../data/mockData';
import { cartAPI, getToken } from '../api';

// ── Auth Store ──
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        // Automatically sync guest cart items with user's persistent backend cart
        try {
          useCartStore.getState().syncWithBackend();
        } catch (_) {}
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      addAddress: (addressData) => {
        const newAddr: Address = {
          ...addressData,
          id: `addr_${Date.now()}`,
          isDefault: addressData.isDefault ?? false,
        };
        set((state) => {
          if (!state.user) return state;
          const currentAddresses = state.user.addresses || [];
          const updated = newAddr.isDefault
            ? currentAddresses.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
            : [...currentAddresses, newAddr];
          return { user: { ...state.user, addresses: updated } };
        });
        return newAddr;
      },
      updateAddress: (id, updates) =>
        set((state) => {
          if (!state.user) return state;
          const currentAddresses = state.user.addresses || [];
          const updated = currentAddresses.map((addr) => {
            if (addr.id === id) {
              return { ...addr, ...updates };
            }
            if (updates.isDefault) {
              return { ...addr, isDefault: false };
            }
            return addr;
          });
          return { user: { ...state.user, addresses: updated } };
        }),
      deleteAddress: (id) =>
        set((state) => {
          if (!state.user) return state;
          const filtered = (state.user.addresses || []).filter((a) => a.id !== id);
          if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
            filtered[0].isDefault = true;
          }
          return { user: { ...state.user, addresses: filtered } };
        }),
      setDefaultAddress: (id) =>
        set((state) => {
          if (!state.user) return state;
          const updated = (state.user.addresses || []).map((a) => ({
            ...a,
            isDefault: a.id === id,
          }));
          return { user: { ...state.user, addresses: updated } };
        }),
    }),
    { name: 'sportika-auth' }
  )
);

// ── Product Store (Live E-Commerce Catalog) ──
interface ProductStore {
  products: Product[];
  addProduct: (product: Partial<Product>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  decrementStock: (productId: string, quantity: number) => void;
  resetToDefaults: () => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: MOCK_PRODUCTS,
      addProduct: (productData) => {
        const id = String(Date.now());
        const slug = (productData.name || 'product')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const newProduct: Product = {
          id,
          name: productData.name || 'New Sportswear Item',
          slug: `${slug}-${id.slice(-4)}`,
          brand: 'Sportika',
          description: productData.description || 'Engineered with high performance fabric.',
          category: productData.category || 'men',
          subcategory: productData.subcategory || 'tshirts',
          sport: productData.sport || 'Training',
          images: productData.images?.length ? productData.images : ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80'],
          price: Number(productData.price) || 999,
          originalPrice: Number(productData.originalPrice) || Number(productData.price) * 1.5 || 1499,
          discount: productData.discount || 33,
          sizes: productData.sizes?.length ? productData.sizes : [
            { size: 'S', stock: 15 },
            { size: 'M', stock: 25 },
            { size: 'L', stock: 20 },
            { size: 'XL', stock: 10 },
          ],
          colors: productData.colors?.length ? productData.colors : [
            { name: 'Navy Blue', hex: '#1B2A4A', stock: 35 },
            { name: 'Carbon Black', hex: '#111111', stock: 35 },
          ],
          rating: 4.8,
          reviewCount: 12,
          stock: Number(productData.stock) || 70,
          sold: 0,
          tags: productData.tags || ['Athletic', 'New Arrival'],
          featured: Boolean(productData.featured),
          newArrival: true,
          bestseller: false,
          active: productData.active ?? true,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ products: [newProduct, ...state.products] }));
        return newProduct;
      },
      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      decrementStock: (productId, quantity) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? { ...p, stock: Math.max(0, p.stock - quantity), sold: p.sold + quantity }
              : p
          ),
        })),
      resetToDefaults: () => set({ products: MOCK_PRODUCTS }),
    }),
    { name: 'sportika-products' }
  )
);

// ── Order Store (Live Customer & Admin Orders) ──
interface OrderStore {
  orders: Order[];
  createOrder: (orderData: {
    items: Order['items'];
    address: Address;
    paymentMethod: 'razorpay' | 'upi' | 'cod';
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    couponCode?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, description?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: MOCK_ORDERS,
      createOrder: (data) => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `SPT-${dateStr}-${randomNum}`;
        const id = `ord_${Date.now()}`;

        const newOrder: Order = {
          id,
          orderNumber,
          userId: 'usr_1',
          items: data.items,
          address: data.address,
          payment: {
            method: data.paymentMethod,
            status: data.paymentMethod === 'cod' ? 'pending' : 'paid',
            amount: data.total,
            paidAt: data.paymentMethod === 'cod' ? undefined : now.toISOString(),
          },
          status: 'confirmed',
          subtotal: data.subtotal,
          discount: data.discount,
          shipping: data.shipping,
          tax: data.tax,
          total: data.total,
          couponCode: data.couponCode,
          tracking: [
            {
              status: 'Order Placed',
              description: 'Your order has been received and verified',
              timestamp: now.toISOString(),
            },
            {
              status: 'Confirmed',
              description: 'Payment verified. Preparing your order for packaging',
              location: 'Sportika Central Hub, Pune',
              timestamp: new Date(now.getTime() + 1000 * 60 * 2).toISOString(),
            },
          ],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          expectedDelivery: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 4).toISOString(),
        };

        set((state) => ({ orders: [newOrder, ...state.orders] }));
        return newOrder;
      },
      updateOrderStatus: (orderId, status, description) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            const statusLabels: Record<OrderStatus, string> = {
              pending: 'Pending verification',
              confirmed: 'Order Confirmed',
              processing: 'Items are being packed',
              shipped: 'Dispatched with BlueDart Logistics',
              out_for_delivery: 'Out for delivery to your address',
              delivered: 'Package delivered successfully',
              cancelled: 'Order was cancelled',
              return_requested: 'Return request submitted',
              returned: 'Item returned to warehouse',
              refunded: 'Refund processed to original payment method',
            };
            const newTrack = {
              status: status.replace(/_/g, ' ').toUpperCase(),
              description: description || statusLabels[status] || `Status updated to ${status}`,
              timestamp: new Date().toISOString(),
            };
            const currentTracking = o.tracking || [];
            return {
              ...o,
              status,
              updatedAt: new Date().toISOString(),
              tracking: [newTrack, ...currentTracking],
            };
          }),
        })),
      cancelOrder: (orderId, reason) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              status: 'cancelled',
              updatedAt: new Date().toISOString(),
              tracking: [
                {
                  status: 'CANCELLED',
                  description: reason || 'Order cancelled by customer',
                  timestamp: new Date().toISOString(),
                },
                ...(o.tracking || []),
              ],
            };
          }),
        })),
    }),
    { name: 'sportika-orders' }
  )
);

// ── Coupon Store ──
export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'SPORT20',
    type: 'percentage',
    value: 20,
    minOrder: 799,
    maxDiscount: 500,
    usageLimit: 1000,
    usedCount: 248,
    expiresAt: '2027-12-31',
    active: true,
  },
  {
    id: 'c2',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrder: 499,
    maxDiscount: 300,
    usageLimit: 2000,
    usedCount: 890,
    expiresAt: '2027-12-31',
    active: true,
  },
  {
    id: 'c3',
    code: 'FLAT500',
    type: 'fixed',
    value: 500,
    minOrder: 1999,
    usageLimit: 500,
    usedCount: 112,
    expiresAt: '2027-12-31',
    active: true,
  },
  {
    id: 'c4',
    code: 'FREESHIP',
    type: 'fixed',
    value: 99,
    minOrder: 399,
    usageLimit: 1500,
    usedCount: 430,
    expiresAt: '2027-12-31',
    active: true,
  },
];

interface CouponStore {
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => Coupon;
  deleteCoupon: (id: string) => void;
  toggleCoupon: (id: string) => void;
}

export const useCouponStore = create<CouponStore>()(
  persist(
    (set) => ({
      coupons: DEFAULT_COUPONS,
      addCoupon: (data) => {
        const newCoupon: Coupon = {
          ...data,
          id: `c_${Date.now()}`,
          code: data.code.toUpperCase().trim(),
          usedCount: 0,
        };
        set((state) => ({ coupons: [newCoupon, ...state.coupons] }));
        return newCoupon;
      },
      deleteCoupon: (id) =>
        set((state) => ({ coupons: state.coupons.filter((c) => c.id !== id) })),
      toggleCoupon: (id) =>
        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
        })),
    }),
    { name: 'sportika-coupons' }
  )
);

// ── Cart Store ──
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: any, size?: string, color?: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  couponCode: string | null;
  couponDiscount: number;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  fetchCart: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      couponDiscount: 0,

      addItem: (productOrItem: any, size?: string, color?: string, quantity = 1) => {
        let product: Product;
        let finalSize = size || 'M';
        let finalColor = color || 'Standard';
        let finalQty = quantity;

        if (productOrItem && !productOrItem.images && productOrItem.product) {
          product = productOrItem.product;
          finalSize = productOrItem.size || finalSize;
          finalColor = productOrItem.color || finalColor;
          finalQty = productOrItem.quantity || 1;
        } else if (productOrItem && !productOrItem.images && productOrItem.name) {
          const pId = productOrItem.productId || productOrItem.id;
          product = {
            id: pId,
            name: productOrItem.name,
            slug: productOrItem.slug || 'product',
            brand: 'Sportika',
            description: '',
            category: 'men',
            subcategory: 'tshirts',
            images: [productOrItem.image || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80'],
            price: productOrItem.price || 0,
            originalPrice: productOrItem.originalPrice || productOrItem.price || 0,
            discount: 0,
            sizes: [],
            colors: [],
            rating: 5,
            reviewCount: 1,
            stock: 50,
            sold: 10,
            tags: [],
            featured: false,
            newArrival: false,
            bestseller: false,
            active: true,
            createdAt: new Date().toISOString(),
          };
          finalSize = productOrItem.size || finalSize;
          finalColor = productOrItem.color || finalColor;
          finalQty = productOrItem.quantity || 1;
        } else {
          product = productOrItem;
        }

        const pId = product?.id || 'unknown';
        const itemPrice = product?.price || 0;

        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === pId && item.size === finalSize && item.color === finalColor
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === pId && item.size === finalSize && item.color === finalColor
                  ? { ...item, quantity: item.quantity + finalQty }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { productId: pId, product, size: finalSize, color: finalColor, quantity: finalQty, price: itemPrice },
            ],
          };
        });

        // Backend persistence when logged in
        if (getToken()) {
          cartAPI.addItem({
            productId: pId,
            product,
            size: finalSize,
            color: finalColor,
            quantity: finalQty,
            price: itemPrice,
          }).catch((err) => console.warn('Background cart add sync error:', err));
        }
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.size === size && item.color === color)
          ),
        }));

        if (getToken()) {
          cartAPI.removeItem(productId, size, color).catch((err) =>
            console.warn('Background cart remove sync error:', err)
          );
        }
      },

      updateQuantity: (productId, size, color, quantity) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (item) => !(item.productId === productId && item.size === size && item.color === color)
                )
              : state.items.map((item) =>
                  item.productId === productId && item.size === size && item.color === color
                    ? { ...item, quantity }
                    : item
                ),
        }));

        if (getToken()) {
          cartAPI.updateQuantity(productId, size, color, quantity).catch((err) =>
            console.warn('Background cart quantity sync error:', err)
          );
        }
      },

      clearCart: () => {
        set({ items: [], couponCode: null, couponDiscount: 0 });
        if (getToken()) {
          cartAPI.clearCart().catch((err) => console.warn('Background cart clear sync error:', err));
        }
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
      },

      getTotal: () => {
        const { items, couponDiscount } = get();
        const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
        const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
        const tax = Math.round(subtotal * 0.05);
        return Math.max(0, subtotal + shipping + tax - couponDiscount);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      fetchCart: async () => {
        if (!getToken()) return;
        try {
          const res = await cartAPI.getCart();
          if (res.success && Array.isArray(res.data)) {
            set({ items: res.data as CartItem[] });
          }
        } catch (err) {
          console.warn('Could not fetch cart from backend:', err);
        }
      },

      syncWithBackend: async () => {
        if (!getToken()) return;
        try {
          const localItems = get().items;
          const res = await cartAPI.syncCart(localItems);
          if (res.success && Array.isArray(res.data)) {
            set({ items: res.data as CartItem[] });
          }
        } catch (err) {
          console.warn('Could not sync cart with backend:', err);
        }
      },
    }),
    { name: 'sportika-cart' }
  )
);

// ── Wishlist Store ──
interface WishlistStore {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => boolean;
  isWishlisted: (productId: string) => boolean;
  getCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) => ({
          items: [
            ...state.items.filter((i) => i.productId !== product.id),
            { productId: product.id, product, addedAt: new Date().toISOString() },
          ],
        })),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      toggleItem: (product) => {
        const { items, addItem, removeItem } = get();
        const exists = items.some((i) => i.productId === product.id);
        if (exists) {
          removeItem(product.id);
          return false;
        } else {
          addItem(product);
          return true;
        }
      },

      isWishlisted: (productId) => get().items.some((i) => i.productId === productId),
      getCount: () => get().items.length,
    }),
    { name: 'sportika-wishlist' }
  )
);

// ── UI Store ──
interface UIStore {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  notifications: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  addNotification: (type: 'success' | 'error' | 'info' | any, message?: string) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  searchQuery: '',
  notifications: [],

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addNotification: (typeOrPayload: any, maybeMessage?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    let type: 'success' | 'error' | 'info' = 'info';
    let message = '';
    if (typeof typeOrPayload === 'object' && typeOrPayload !== null) {
      type = typeOrPayload.type || 'info';
      message = typeOrPayload.message || '';
    } else {
      type = typeOrPayload || 'info';
      message = maybeMessage || '';
    }
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 3500);
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
