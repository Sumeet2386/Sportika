import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import MobileMenu from './components/MobileMenu';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import SizeGuidePage from './pages/SizeGuidePage';
import {
  ShippingPolicyPage,
  ReturnPolicyPage,
  PrivacyPolicyPage,
  TermsPage,
  ContactPage,
  FaqPage
} from './pages/PolicyPages';
import { useUIStore, useAuthStore, useCartStore } from './store';

// Protected route wrapper
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location.pathname, adminNeeded: true }} replace />;
  }
  return <>{children}</>;
}

// Layout with nav/footer
function MainLayout({ children }: { children: React.ReactNode }) {
  const { isMobileMenuOpen } = useUIStore();
  return (
    <>
      <Navbar />
      {isMobileMenuOpen && <MobileMenu />}
      <CartSidebar />
      <main style={{ minHeight: 'calc(100vh - 72px)' }}>{children}</main>
      <Footer />
    </>
  );
}

// Notifications Toast
function NotificationToast() {
  const { notifications, removeNotification } = useUIStore();
  return (
    <div className="toast-container">
      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => removeNotification(n.id)}
          style={{
            background: 'white',
            borderRadius: 12,
            padding: '12px 16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: `1px solid ${n.type === 'success' ? '#86EFAC' : n.type === 'error' ? '#FCA5A5' : '#BAE6FD'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            animation: 'fadeInUp 0.3s ease',
            minWidth: 280,
            maxWidth: 360,
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>
            {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span style={{ fontFamily: 'Inter', fontSize: '0.875rem', color: '#0D1117', flex: 1 }}>
            {n.message}
          </span>
        </div>
      ))}
    </div>
  );
}

// Automatically scroll window to top on route navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Hydrate cart from SQLite database on app load if logged in
function CartInitializer() {
  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartInitializer />
      <NotificationToast />
      <Routes>
        {/* Auth Pages (no nav/footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin (no main footer) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Main App Routes */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
        <Route path="/products/:slug" element={<MainLayout><ProductDetailPage /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
        <Route path="/wishlist" element={<MainLayout><WishlistPage /></MainLayout>} />

        {/* Protected Routes */}
        <Route path="/checkout" element={<MainLayout><ProtectedRoute><CheckoutPage /></ProtectedRoute></MainLayout>} />
        <Route path="/orders" element={<MainLayout><ProtectedRoute><OrdersPage /></ProtectedRoute></MainLayout>} />
        <Route path="/profile" element={<MainLayout><ProtectedRoute><ProfilePage /></ProtectedRoute></MainLayout>} />

        {/* Commercial Brand & Sizing Pages */}
        <Route path="/size-guide" element={<MainLayout><SizeGuidePage /></MainLayout>} />
        <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />

        {/* Commercial Legal & Customer Support Policies */}
        <Route path="/shipping" element={<MainLayout><ShippingPolicyPage /></MainLayout>} />
        <Route path="/returns" element={<MainLayout><ReturnPolicyPage /></MainLayout>} />
        <Route path="/privacy" element={<MainLayout><PrivacyPolicyPage /></MainLayout>} />
        <Route path="/terms" element={<MainLayout><TermsPage /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
        <Route path="/faq" element={<MainLayout><FaqPage /></MainLayout>} />

        {/* Fallback */}
        <Route path="*" element={
          <MainLayout>
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFF' }}>
              <div style={{ fontSize: '6rem', marginBottom: 20 }}>🏃</div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, marginBottom: 12 }}>404 — Page Not Found</h1>
              <p style={{ color: '#8896B3', marginBottom: 32 }}>Looks like this page ran away!</p>
              <a href="/" className="btn btn-primary btn-lg">Back to Home</a>
            </div>
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
