import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ChevronRight, User, ShoppingCart, Heart, Package, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useUIStore, useAuthStore, useCartStore } from '../store';
import SportikaLogo from './SportikaLogo';

export default function MobileMenu() {
  const { toggleMobileMenu } = useUIStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const openCart = useCartStore(s => s.openCart);
  const navigate = useNavigate();

  const handleNav = (to: string) => {
    toggleMobileMenu();
    navigate(to);
  };

  const handleLogout = () => {
    logout();
    toggleMobileMenu();
    navigate('/');
  };

  return (
    <>
      {/* Overlay */}
      <div className="overlay" onClick={toggleMobileMenu} style={{ zIndex: 1049 }} />

      <div className="mobile-menu">
        {/* Header */}
        <div className="mobile-menu-header">
          <SportikaLogo size={34} showText={true} horizontal={true} />
          <button onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', color: '#4A5280', cursor: 'pointer', padding: 6 }}>
            <X size={22} />
          </button>
        </div>

        {/* Main nav */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {[
            { label: 'Home', to: '/' },
            { label: 'MEN', to: '/products?category=men' },
            { label: 'WOMEN', to: '/products?category=women' },
            { label: 'KIDS', to: '/products' },
            { label: 'EXPLORE', to: '/products' },
            { label: 'SALE 🔥', to: '/products?filter=sale', sale: true },
          ].map(item => (
            <button
              key={item.to + item.label}
              onClick={() => handleNav(item.to)}
              className={`mobile-nav-link${(item as any).sale ? ' sale' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {item.label}
              <ChevronRight size={16} style={{ color: '#8B93B8' }} />
            </button>
          ))}

          {/* Sub Categories */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4E7F0' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B93B8', marginBottom: 12 }}>
              Shop by Category
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { icon: '👕', name: 'T-Shirts', to: '/products?sub=tshirts' },
                { icon: '🩳', name: 'Shorts', to: '/products?sub=shorts' },
                { icon: '🧥', name: 'Jackets', to: '/products?sub=jackets' },
                { icon: '👖', name: 'Track Pants', to: '/products?sub=track-pants' },
              ].map(cat => (
                <button key={cat.name} onClick={() => handleNav(cat.to)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 4px', background: '#F5F6FA', borderRadius: 12, border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.7rem', color: '#4A5280', textAlign: 'center' }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User section */}
          <div style={{ padding: '16px 0' }}>
            {isAuthenticated ? (
              <>
                <div style={{ padding: '12px 20px', background: '#F5F6FA', marginBottom: 8 }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8B93B8' }}>{user?.email}</div>
                </div>
                {[
                  { icon: <Package size={16} />, label: 'My Orders', to: '/orders' },
                  { icon: <Heart size={16} />, label: 'Wishlist', to: '/wishlist' },
                  { icon: <Settings size={16} />, label: 'Profile', to: '/profile' },
                  ...(user?.role === 'admin' ? [{ icon: <LayoutDashboard size={16} />, label: 'Admin Dashboard', to: '/admin' }] : []),
                ].map(item => (
                  <button key={item.to} onClick={() => handleNav(item.to)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', color: '#4A5280', borderBottom: '1px solid #E4E7F0' }}>
                    {item.icon} {item.label}
                  </button>
                ))}
                <button onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', color: '#EF4444', borderTop: '1px solid #E4E7F0' }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <div style={{ padding: '16px 20px', display: 'flex', gap: 12 }}>
                <button onClick={() => handleNav('/login')}
                  style={{ flex: 1, padding: '12px', background: '#1B1F3B', color: 'white', border: 'none', borderRadius: 50, fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                  Sign In
                </button>
                <button onClick={() => handleNav('/register')}
                  style={{ flex: 1, padding: '12px', background: 'white', color: '#1B1F3B', border: '1.5px solid #1B1F3B', borderRadius: 50, fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #E4E7F0', display: 'flex', gap: 12 }}>
          <button onClick={() => { toggleMobileMenu(); openCart(); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#FF6B35', color: 'white', border: 'none', borderRadius: 50, fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
            <ShoppingCart size={16} /> Cart
          </button>
          <button onClick={() => handleNav('/wishlist')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: 'white', color: '#1B1F3B', border: '1.5px solid #E4E7F0', borderRadius: 50, fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
            <Heart size={16} /> Wishlist
          </button>
        </div>
      </div>
    </>
  );
}
