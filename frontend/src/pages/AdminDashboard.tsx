import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Settings,
  DollarSign, ShoppingCart, LogOut, Plus,
  Edit3, Trash2, Eye, Search, ChevronDown, Bell,
  ArrowUpRight, ArrowDownRight, Menu, X, Check, AlertTriangle, Printer, ExternalLink
} from 'lucide-react';
import { useAuthStore, useProductStore, useOrderStore, useCouponStore, useUIStore } from '../store';
import type { Product, Order, OrderStatus, Coupon } from '../types';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'coupons' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');

  // Stores
  const { logout, user } = useAuthStore();
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { orders, updateOrderStatus } = useOrderStore();
  const { coupons, addCoupon, deleteCoupon, toggleCoupon } = useCouponStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'men' as 'men' | 'women' | 'unisex',
    subcategory: 'tshirts' as any,
    sport: 'Running & Training',
    price: 999,
    originalPrice: 1499,
    discount: 33,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    description: 'High-performance athletic apparel with moisture-wicking technology.',
    featured: false,
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 15,
    minOrder: 799,
    maxDiscount: 300,
    usageLimit: 500,
    expiresAt: '2026-12-31',
    active: true,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Live Metrics
  const stats = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
    const totalOrdersCount = orders.length;
    const lowStockCount = products.filter((p) => p.stock < 20).length;
    return {
      revenue: totalRev,
      orders: totalOrdersCount,
      customers: 24,
      products: products.length,
      lowStock: lowStockCount,
    };
  }, [orders, products]);

  // Handlers for Products
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      addNotification('error', 'Product name is required');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: productForm.name,
        category: productForm.category,
        subcategory: productForm.subcategory,
        sport: productForm.sport,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        discount: Math.round(((Number(productForm.originalPrice) - Number(productForm.price)) / Number(productForm.originalPrice)) * 100),
        stock: Number(productForm.stock),
        images: [productForm.image],
        description: productForm.description,
        featured: productForm.featured,
      });
      addNotification('success', `Product "${productForm.name}" updated!`);
      setEditingProduct(null);
    } else {
      addProduct({
        name: productForm.name,
        category: productForm.category,
        subcategory: productForm.subcategory,
        sport: productForm.sport,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        discount: Math.round(((Number(productForm.originalPrice) - Number(productForm.price)) / Number(productForm.originalPrice)) * 100),
        stock: Number(productForm.stock),
        images: [productForm.image],
        description: productForm.description,
        featured: productForm.featured,
      });
      addNotification('success', `Product "${productForm.name}" created!`);
      setIsAddProductOpen(false);
    }
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      sport: p.sport || 'Training',
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discount,
      stock: p.stock,
      image: p.images[0] || '',
      description: p.description,
      featured: p.featured,
    });
  };

  const handleDeleteProduct = (p: Product) => {
    if (window.confirm(`Are you sure you want to delete "${p.name}"?`)) {
      deleteProduct(p.id);
      addNotification('info', `Product "${p.name}" deleted.`);
    }
  };

  // Handlers for Coupons
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      addNotification('error', 'Coupon code is required');
      return;
    }
    addCoupon(couponForm);
    addNotification('success', `Coupon ${couponForm.code.toUpperCase()} created!`);
    setIsAddCouponOpen(false);
    setCouponForm({
      code: '',
      type: 'percentage',
      value: 15,
      minOrder: 799,
      maxDiscount: 300,
      usageLimit: 500,
      expiresAt: '2026-12-31',
      active: true,
    });
  };

  // Nav items
  const navItems: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { key: 'products', label: 'Products', icon: <Package size={18} /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
    { key: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { key: 'coupons', label: 'Coupons', icon: <Tag size={18} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === 'all' || o.status === orderFilter;
    const matchesSearch =
      !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.address.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: sidebarOpen ? 260 : 72, transition: 'width 0.3s' }}>
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {sidebarOpen && (
              <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.25rem', color: 'white' }}>
                SPORTI<span style={{ color: '#FF6F00' }}>KA</span>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 400, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Admin Portal</div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 8, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
              title={!sidebarOpen ? item.label : undefined}
              id={`admin-nav-${item.key}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
              {item.key === 'orders' && orders.some((o) => o.status === 'confirmed' || o.status === 'pending') && (
                <span style={{ marginLeft: 'auto', background: '#FF6F00', color: 'white', borderRadius: 50, padding: '2px 7px', fontSize: '0.7rem', fontWeight: 800 }}>
                  {orders.filter((o) => o.status === 'confirmed' || o.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1565C0, #FF6F00)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '0.875rem'
              }}>A</div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.8rem', color: 'white' }}>{user?.name || 'Administrator'}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>admin@sportika.in</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ width: '100%', color: '#FC8181' }}
            id="admin-logout"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4, color: '#0F172A' }}>
              {navItems.find((n) => n.key === activeTab)?.label}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 38, width: 220, fontSize: '0.85rem' }}
                id="admin-search"
              />
            </div>
            <Link to="/" target="_blank" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ExternalLink size={14} /> View Storefront
            </Link>
          </div>
        </div>

        {/* ─── TAB: DASHBOARD ─── */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPI Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue"><DollarSign size={24} /></div>
                <div>
                  <div className="stat-value">₹{stats.revenue.toLocaleString('en-IN')}</div>
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-change positive"><ArrowUpRight size={12} /> Live from {orders.length} orders</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-orange"><ShoppingCart size={24} /></div>
                <div>
                  <div className="stat-value">{stats.orders}</div>
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-change positive"><ArrowUpRight size={12} /> Active Storefront</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-purple"><Package size={24} /></div>
                <div>
                  <div className="stat-value">{stats.products}</div>
                  <div className="stat-label">Products Active</div>
                  <div className="stat-change" style={{ color: stats.lowStock > 0 ? '#E74C3C' : '#16A34A' }}>
                    {stats.lowStock > 0 ? `⚠️ ${stats.lowStock} Low Stock` : '✅ Stock Healthy'}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-green"><Users size={24} /></div>
                <div>
                  <div className="stat-value">{stats.customers}</div>
                  <div className="stat-label">Total Customers</div>
                  <div className="stat-change positive"><ArrowUpRight size={12} /> +18% this month</div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Low Stock Banner */}
            {stats.lowStock > 0 && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <AlertTriangle size={20} color="#D97706" />
                  <span style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: 600 }}>
                    {stats.lowStock} products are running low on stock (under 20 units). Check inventory to avoid stockouts.
                  </span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('products')}>
                  Manage Stock
                </button>
              </div>
            )}

            {/* Recent Orders Overview */}
            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E2E8F8', marginBottom: 24, boxShadow: '0 2px 12px rgba(27,31,59,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem' }}>Recent Orders</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Latest orders placed by customers across India</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('orders')}>View All Orders →</button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1565C0' }}>#{order.orderNumber}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{order.address.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{order.address.city}, {order.address.state}</div>
                        </td>
                        <td>{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                        <td style={{ fontWeight: 700 }}>₹{order.total.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#EEF2FF', color: '#1565C0' }}>
                            {order.payment.method}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700,
                            background: order.status === 'delivered' ? 'rgba(34,197,94,0.1)' : order.status === 'shipped' ? 'rgba(59,130,246,0.1)' : order.status === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                            color: order.status === 'delivered' ? '#16A34A' : order.status === 'shipped' ? '#2563EB' : order.status === 'cancelled' ? '#DC2626' : '#D97706'
                          }}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 8px' }}
                            onClick={() => setSelectedOrder(order)}
                            title="View Order Details"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: PRODUCTS ─── */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem' }}>{products.length} Products in Catalog</span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    category: 'men',
                    subcategory: 'tshirts',
                    sport: 'Running & Gym',
                    price: 999,
                    originalPrice: 1499,
                    discount: 33,
                    stock: 50,
                    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
                    description: 'Engineered with quick-dry breathable performance fabric.',
                    featured: false,
                  });
                  setIsAddProductOpen(true);
                }}
                id="admin-add-product-btn"
              >
                <Plus size={16} /> Add New Product
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,31,59,0.02)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Sales</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={product.images[0]} alt={product.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', background: '#F1F5F9' }} />
                            <div>
                              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>{product.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: #{product.id.slice(-6)} · {product.sport || 'Sports'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span style={{ fontWeight: 600 }}>{product.category}</span> · {product.subcategory}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#1565C0' }}>₹{product.price.toLocaleString('en-IN')}</div>
                          {product.originalPrice > product.price && (
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString('en-IN')}</div>
                          )}
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                            background: product.stock < 15 ? '#FEE2E2' : '#ECFDF5',
                            color: product.stock < 15 ? '#DC2626' : '#16A34A',
                          }}>
                            {product.stock} units
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{product.sold || 0} sold</td>
                        <td>⭐ {product.rating} ({product.reviewCount})</td>
                        <td>
                          <button
                            onClick={() => updateProduct(product.id, { active: !product.active })}
                            style={{
                              padding: '4px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                              background: product.active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: product.active ? '#16A34A' : '#DC2626'
                            }}
                            title="Click to toggle status"
                          >
                            {product.active ? 'Active' : 'Draft'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="icon-btn"
                              title="Edit Product"
                              onClick={() => handleOpenEdit(product)}
                              id={`edit-prod-${product.id}`}
                            >
                              <Edit3 size={15} />
                            </button>
                            <Link to={`/products/${product.slug}`} target="_blank" className="icon-btn" title="View on Store">
                              <Eye size={15} />
                            </Link>
                            <button
                              className="icon-btn"
                              title="Delete Product"
                              style={{ color: '#DC2626' }}
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: ORDERS ─── */}
        {activeTab === 'orders' && (
          <div>
            {/* Status Filter Chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {(['all', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  className={`tag ${orderFilter === s ? 'active' : ''}`}
                  onClick={() => setOrderFilter(s)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {s.replace(/_/g, ' ')}
                  <span style={{ marginLeft: 6, opacity: 0.7, fontSize: '0.75rem' }}>
                    ({s === 'all' ? orders.length : orders.filter((o) => o.status === s).length})
                  </span>
                </button>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,31,59,0.02)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer & Address</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Placed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1565C0' }}>
                        #{order.orderNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{order.address.name}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                          {order.address.city}, {order.address.state} · 📞 {order.address.phone}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.items.length} items</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {order.items[0]?.name.slice(0, 20)}...
                        </div>
                      </td>
                      <td style={{ fontWeight: 800, color: '#0F172A' }}>
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#EEF2FF', color: '#1565C0' }}>
                          {order.payment.method}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: order.payment.status === 'paid' ? '#16A34A' : '#D97706', marginTop: 2, fontWeight: 600 }}>
                          {order.payment.status.toUpperCase()}
                        </div>
                      </td>
                      <td>
                        {/* Live Status Updater Dropdown */}
                        <select
                          value={order.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as OrderStatus;
                            updateOrderStatus(order.id, newStatus);
                            addNotification('success', `Order #${order.orderNumber} updated to ${newStatus}!`);
                          }}
                          className="form-input"
                          style={{
                            fontSize: '0.8rem', padding: '6px 10px', minWidth: 140, fontWeight: 700,
                            borderRadius: 8, borderColor: '#CBD5E1', cursor: 'pointer',
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                          onClick={() => setSelectedOrder(order)}
                          title="View Details"
                        >
                          <Eye size={15} /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: CUSTOMERS ─── */}
        {activeTab === 'customers' && (
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F8', padding: 24, boxShadow: '0 2px 12px rgba(27,31,59,0.02)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 20, fontSize: '1.15rem' }}>Customer Directory</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Orders</th>
                  <th>Total Spend</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Sumeet Gite', email: 'sumeet@sportika.in', phone: '+91 98765 43210', orders: orders.length, spent: orders.reduce((s, o) => s + o.total, 0), city: 'Pune' },
                  { name: 'Priya Sharma', email: 'priya@gmail.com', phone: '+91 87654 32109', orders: 4, spent: 7850, city: 'Mumbai' },
                  { name: 'Rahul Desai', email: 'rahul.d@yahoo.com', phone: '+91 76543 21098', orders: 2, spent: 3499, city: 'Bangalore' },
                  { name: 'Ankit Kumar', email: 'ankit.fit@gmail.com', phone: '+91 65432 10987', orders: 3, spent: 5200, city: 'Delhi' },
                ].map((c) => (
                  <tr key={c.email}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1565C0, #FF6F00)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.85rem'
                        }}>
                          {c.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{c.name}</span>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td style={{ fontWeight: 700 }}>{c.orders} orders</td>
                    <td style={{ fontWeight: 800, color: '#1565C0' }}>₹{c.spent.toLocaleString('en-IN')}</td>
                    <td>{c.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB: COUPONS ─── */}
        {activeTab === 'coupons' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem' }}>Discount & Promo Coupons</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Codes applied by shoppers during cart & checkout</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setIsAddCouponOpen(true)} id="add-coupon-btn">
                <Plus size={15} /> Create Coupon
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  style={{
                    background: 'white', borderRadius: 18, padding: 22,
                    border: `1.5px solid ${coupon.active ? '#E2E8F8' : '#FECACA'}`,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.2rem', color: '#1565C0', letterSpacing: 1.2 }}>
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => toggleCoupon(coupon.id)}
                      style={{
                        padding: '3px 10px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 800, border: 'none', cursor: 'pointer',
                        background: coupon.active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: coupon.active ? '#16A34A' : '#DC2626'
                      }}
                    >
                      {coupon.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', marginBottom: 4 }}>
                    {coupon.type === 'percentage' ? `${coupon.value}% Discount` : `₹${coupon.value} Flat Off`}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 16 }}>
                    Min. Order: ₹{coupon.minOrder} · Expires: {coupon.expiresAt}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Used {coupon.usedCount} times</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#DC2626', padding: '4px 8px' }}
                      onClick={() => {
                        deleteCoupon(coupon.id);
                        addNotification('info', `Coupon ${coupon.code} deleted.`);
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: SETTINGS ─── */}
        {activeTab === 'settings' && (
          <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid #E2E8F8', maxWidth: 640, boxShadow: '0 2px 12px rgba(27,31,59,0.02)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 24, fontSize: '1.25rem' }}>Store Configurations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Store Brand Name</label>
                <input type="text" className="form-input" defaultValue="Sportika Global Sportswear" id="setting-store-name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Customer Support Email</label>
                  <input type="email" className="form-input" defaultValue="support@sportika.in" id="setting-email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Toll-Free Helpline</label>
                  <input type="text" className="form-input" defaultValue="+91 1800-SPORTIKA" id="setting-phone" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">GSTIN Identification</label>
                  <input type="text" className="form-input" defaultValue="27ABCDE1234F1Z5" id="setting-gst" />
                </div>
                <div className="form-group">
                  <label className="form-label">Free Shipping Minimum (₹)</label>
                  <input type="number" className="form-input" defaultValue={999} id="setting-shipping" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Warehouse Dispatch Hub</label>
                <input type="text" className="form-input" defaultValue="Plot 42, Sportika Logistics Park, Pune 411001" id="setting-hub" />
              </div>
              <button
                className="btn btn-primary"
                onClick={() => addNotification('success', 'Store settings saved successfully!')}
                id="save-settings-btn"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ─── MODAL: ADD / EDIT PRODUCT ─── */}
      {(isAddProductOpen || editingProduct) && (
        <div className="modal-overlay" onClick={() => { setIsAddProductOpen(false); setEditingProduct(null); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>
                {editingProduct ? 'Edit Product' : 'Add New Sportswear Product'}
              </h3>
              <button
                onClick={() => { setIsAddProductOpen(false); setEditingProduct(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.name}
                    onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Sportika Stealth Compression T-Shirt"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Gender Category</label>
                    <select
                      className="form-input"
                      value={productForm.category}
                      onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value as any }))}
                    >
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Apparel Subcategory</label>
                    <select
                      className="form-input"
                      value={productForm.subcategory}
                      onChange={(e) => setProductForm((f) => ({ ...f, subcategory: e.target.value as any }))}
                    >
                      <option value="tshirts">T-Shirts</option>
                      <option value="shorts">Shorts</option>
                      <option value="jackets">Jackets</option>
                      <option value="track-pants">Track Pants</option>
                      <option value="shoes">Shoes</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={productForm.price}
                      onChange={(e) => setProductForm((f) => ({ ...f, price: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MRP / Original (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm((f) => ({ ...f, originalPrice: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Stock *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={productForm.stock}
                      onChange={(e) => setProductForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">High-Resolution Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={productForm.image}
                    onChange={(e) => setProductForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="https://..."
                    required
                  />
                  {productForm.image && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={productForm.image} alt="Preview" style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Live Image Preview</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Product Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="feat-check"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm((f) => ({ ...f, featured: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: '#1565C0' }}
                  />
                  <label htmlFor="feat-check" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}>
                    Feature on Homepage Carousel
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setIsAddProductOpen(false); setEditingProduct(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-product-submit">
                  {editingProduct ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE COUPON ─── */}
      {isAddCouponOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCouponOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>Create New Promo Code</h3>
              <button onClick={() => setIsAddCouponOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCoupon}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Coupon Code (Uppercase) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. FLASH30"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select
                      className="form-input"
                      value={couponForm.type}
                      onChange={(e) => setCouponForm((f) => ({ ...f, type: e.target.value as any }))}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Value *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={couponForm.value}
                      onChange={(e) => setCouponForm((f) => ({ ...f, value: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Minimum Order (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={couponForm.minOrder}
                      onChange={(e) => setCouponForm((f) => ({ ...f, minOrder: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={couponForm.expiresAt}
                      onChange={(e) => setCouponForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddCouponOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-coupon-btn">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ORDER DETAILS & COMMERCIAL INVOICE ─── */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>
                  Commercial Tax Invoice #{selectedOrder.orderNumber}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline btn-sm" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Printer size={14} /> Print
                </button>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body">
              {/* Company & Customer header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, paddingBottom: 20, borderBottom: '1px solid #E2E8F8', marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.1rem', color: '#1565C0' }}>SPORTIKA GLOBAL</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.6, marginTop: 4 }}>
                    Sportika Logistics Park, Pune, Maharashtra 411001<br />
                    GSTIN: 27ABCDE1234F1Z5<br />
                    support@sportika.in
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Ship To:</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.6, marginTop: 4 }}>
                    <strong style={{ color: '#0F172A' }}>{selectedOrder.address.name}</strong><br />
                    {selectedOrder.address.line1}{selectedOrder.address.line2 ? `, ${selectedOrder.address.line2}` : ''}<br />
                    {selectedOrder.address.city}, {selectedOrder.address.state} — {selectedOrder.address.pincode}<br />
                    Phone: {selectedOrder.address.phone}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="data-table" style={{ marginBottom: 20 }}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Size & Color</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                        </div>
                      </td>
                      <td>{item.size} / {item.color}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Order Totals Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>Shipping:</span>
                    <span>{selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>GST (5%):</span>
                    <span>₹{selectedOrder.tax.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16A34A' }}>
                      <span>Discount:</span>
                      <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem', color: '#1565C0', borderTop: '1.5px solid #E2E8F8', paddingTop: 8, marginTop: 4 }}>
                    <span>Grand Total:</span>
                    <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Status:</span>
                <span style={{
                  padding: '4px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700,
                  background: selectedOrder.status === 'delivered' ? '#DCFCE7' : '#EFF6FF',
                  color: selectedOrder.status === 'delivered' ? '#16A34A' : '#1565C0'
                }}>
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedOrder(null)}>
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
