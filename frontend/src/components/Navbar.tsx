import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Heart, User, Search, Menu, X, ChevronDown,
  LogOut, Package, Settings, LayoutDashboard, MapPin
} from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore, useUIStore } from '../store';
import SportikaLogo from './SportikaLogo';

const MEGA_MENUS = {
  men: {
    sections: [
      { heading: 'Tops', items: [
        { label: 'T-Shirts', to: '/products?category=men&sub=tshirts' },
        { label: 'Polos', to: '/products?category=men&sub=tshirts' },
        { label: 'Vests', to: '/products?category=men&sub=tshirts' },
        { label: 'Shirts', to: '/products?category=men&sub=tshirts' },
      ]},
      { heading: 'Bottoms', items: [
        { label: 'Track Pants', to: '/products?category=men&sub=track-pants' },
        { label: 'Shorts', to: '/products?category=men&sub=shorts' },
        { label: 'Joggers', to: '/products?category=men&sub=track-pants' },
        { label: 'Cargos', to: '/products?category=men&sub=shorts' },
      ]},
      { heading: 'Layers', items: [
        { label: 'Jackets', to: '/products?category=men&sub=jackets' },
        { label: 'Hoodies', to: '/products?category=men&sub=jackets' },
        { label: 'Co-ord Sets', to: '/products?category=men' },
        { label: "View All Men's", to: '/products?category=men' },
      ]},
    ]
  },
  women: {
    sections: [
      { heading: 'Tops', items: [
        { label: 'T-Shirts & Tops', to: '/products?category=women&sub=tshirts' },
        { label: 'Sports Bras', to: '/products?category=women' },
        { label: 'Tanks & Vests', to: '/products?category=women&sub=tshirts' },
        { label: 'Sweatshirts', to: '/products?category=women&sub=jackets' },
      ]},
      { heading: 'Bottoms', items: [
        { label: 'Leggings & Tights', to: '/products?category=women&sub=track-pants' },
        { label: 'Shorts', to: '/products?category=women&sub=shorts' },
        { label: 'Track Pants', to: '/products?category=women&sub=track-pants' },
        { label: 'Skirts', to: '/products?category=women' },
      ]},
      { heading: 'Collections', items: [
        { label: 'Jackets', to: '/products?category=women&sub=jackets' },
        { label: 'Yoga Collection', to: '/products?category=women' },
        { label: 'Co-ord Sets', to: '/products?category=women' },
        { label: "View All Women's", to: '/products?category=women' },
      ]},
    ]
  },
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [megaMenu, setMegaMenu] = useState<string | null>(null);
  const [searchVal, setSearchVal] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const wishCount = useWishlistStore((s) => s.getCount());
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleMobileMenu } = useUIStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMegaMenu(null);
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const megaMenuStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'white',
    borderRadius: 16,
    boxShadow: '0 16px 60px rgba(27,31,59,0.18)',
    border: '1px solid #E4E7F0',
    padding: '24px 28px',
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0 40px',
    minWidth: 480,
    zIndex: 200,
    animation: 'fadeIn 0.15s ease',
  };

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="announcement-bar">
        <div className="announce-inner">
          <span>🚀 Free Shipping on all orders</span>
          <span className="announce-divider" />
          <span>Use code <strong>SPORT5</strong> — Extra 5% off on your first order</span>
          <span className="announce-divider" />
          <span>⚡ New Collection Just Dropped!</span>
        </div>
      </div>

      {/* ── Main Navbar (two-row like Technosport) ── */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation">
        <div className="container navbar-inner">

          {/* ROW 1: Logo | Search | Icons */}
          <div className="navbar-top-row">
            <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
              <SportikaLogo size={36} showText={true} horizontal={true} />
            </Link>

            <form onSubmit={handleSearch} className="search-container hidden-mobile" style={{ flex: 1 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search for products ..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="search-input"
                id="search-input-navbar"
              />
            </form>

            <div className="navbar-actions">
              {/* Profile */}
              <div style={{ position: 'relative' }}>
                <button className="icon-btn hidden-mobile" onClick={() => setShowUserMenu(v => !v)} aria-label="Account" id="account-btn">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.name} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                    : <User size={20} />
                  }
                  <span className="icon-btn-label">Profile</span>
                </button>
                {showUserMenu && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'white', borderRadius: 14,
                    boxShadow: '0 16px 60px rgba(27,31,59,0.18)',
                    border: '1px solid #E4E7F0', minWidth: 210, overflow: 'hidden', zIndex: 300,
                    animation: 'fadeIn 0.15s ease',
                  }}>
                    {isAuthenticated ? (
                      <>
                        <div style={{ padding: '16px', borderBottom: '1px solid #E4E7F0', background: '#F5F6FA' }}>
                          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#8B93B8' }}>{user?.email}</div>
                        </div>
                        {[
                          { icon: <Package size={15} />, label: 'My Orders', to: '/orders' },
                          { icon: <Heart size={15} />, label: 'Wishlist', to: '/wishlist' },
                          { icon: <Settings size={15} />, label: 'Account Profile', to: '/profile' },
                          ...(user?.role === 'admin' ? [{ icon: <LayoutDashboard size={15} color="#FF6F00" />, label: 'Admin Portal 🛡️', to: '/admin' }] : []),
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#4A5280', fontSize: '0.875rem', transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#F5F6FA')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            {item.icon} {item.label}
                          </Link>
                        ))}
                        <button onClick={handleLogout}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#EF4444', fontSize: '0.875rem', width: '100%', background: 'none', border: 'none', borderTop: '1px solid #E4E7F0', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F5')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setShowUserMenu(false)}
                          style={{ display: 'block', padding: '14px 16px', color: '#1B1F3B', fontWeight: 600, borderBottom: '1px solid #E4E7F0', fontSize: '0.875rem' }}
                        >Sign In</Link>
                        <Link to="/register" onClick={() => setShowUserMenu(false)}
                          style={{ display: 'block', padding: '14px 16px', color: '#3D52D5', fontWeight: 600, fontSize: '0.875rem' }}
                        >Create Account</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <button className="icon-btn hidden-mobile" onClick={() => navigate('/wishlist')} aria-label="Wishlist" id="wishlist-btn">
                <Heart size={20} />
                <span className="icon-btn-label">Wishlist</span>
                {wishCount > 0 && <span className="badge-count">{wishCount}</span>}
              </button>

              {/* Cart */}
              <button className="icon-btn" onClick={openCart} aria-label="Cart" id="cart-btn">
                <ShoppingCart size={20} />
                <span className="icon-btn-label">Cart</span>
                {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
              </button>

              {/* Our Stores */}
              <button className="icon-btn hidden-mobile" onClick={() => navigate('/about')} aria-label="Our Stores">
                <MapPin size={20} />
                <span className="icon-btn-label">Our Stores</span>
              </button>

              {/* Mobile hamburger */}
              <button className="icon-btn visible-mobile" onClick={toggleMobileMenu} aria-label="Menu">
                <Menu size={22} />
              </button>
            </div>
          </div>

          {/* ROW 2: Nav Links (desktop only) */}
          <div className="navbar-bottom-row hidden-mobile">
            <div className="navbar-nav">
              <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>

              {/* Men */}
              <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                onMouseEnter={() => setMegaMenu('men')}
                onMouseLeave={() => setMegaMenu(null)}
              >
                <Link to="/products?category=men" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  MEN <ChevronDown size={13} style={{ opacity: 0.6 }} />
                </Link>
                {megaMenu === 'men' && (
                  <div style={megaMenuStyle}>
                    {MEGA_MENUS.men.sections.map(sec => (
                      <div key={sec.heading}>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B93B8', marginBottom: 12 }}>
                          {sec.heading}
                        </div>
                        {sec.items.map(item => (
                          <Link key={item.label} to={item.to} style={{ display: 'block', padding: '7px 0', color: '#4A5280', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.15s', borderBottom: '1px solid #F5F6FA' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#1B1F3B')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#4A5280')}
                          >{item.label}</Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Women */}
              <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                onMouseEnter={() => setMegaMenu('women')}
                onMouseLeave={() => setMegaMenu(null)}
              >
                <Link to="/products?category=women" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  WOMEN <ChevronDown size={13} style={{ opacity: 0.6 }} />
                </Link>
                {megaMenu === 'women' && (
                  <div style={megaMenuStyle}>
                    {MEGA_MENUS.women.sections.map(sec => (
                      <div key={sec.heading}>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B93B8', marginBottom: 12 }}>
                          {sec.heading}
                        </div>
                        {sec.items.map(item => (
                          <Link key={item.label} to={item.to} style={{ display: 'block', padding: '7px 0', color: '#4A5280', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.15s', borderBottom: '1px solid #F5F6FA' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#1B1F3B')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#4A5280')}
                          >{item.label}</Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/products" className="nav-link">EXPLORE</Link>
              <Link to="/products?filter=sale" className="nav-link sale-link">SALE 🔥</Link>
            </div>
          </div>

        </div>
      </nav>
    </>
  );
}
