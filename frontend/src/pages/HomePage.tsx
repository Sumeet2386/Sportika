import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Zap, ArrowRight, Star, TrendingUp, Award, Shield,
  Truck, RefreshCw, Play, ChevronLeft, Headphones, Tag
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SportikaLogo from '../components/SportikaLogo';
import { useProductStore } from '../store';

/* ─── Countdown Hook ─── */
const SALE_END = new Date(Date.now() + 8 * 60 * 60 * 1000 + 34 * 60 * 1000 + 22 * 1000);

function useCountdown(target: Date) {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setT({ h: Math.floor(diff / 3600000) % 24, m: Math.floor(diff / 60000) % 60, s: Math.floor(diff / 1000) % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

/* ─── Hero Slides ─── */
const SLIDES = [
  {
    id: 1,
    tag: 'NEW SEASON 2024',
    headline: ['THE FINAL', 'MOVE'],
    accent: 'GLOBALLY.',
    sub: 'Engineered for champions. Built for every athlete who refuses to slow down.',
    cta: { label: "Shop Men's", to: '/products?category=men', secondary: "Shop Women's", toSecondary: '/products?category=women' },
    img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1400&q=80',
    badge: { text: 'Up to 40% OFF', color: '#FF6B35' },
  },
  {
    id: 2,
    tag: 'FLASH COLLECTION',
    headline: ['RUN FASTER.', 'TRAIN HARDER.'],
    accent: 'LOOK ICONIC.',
    sub: "Women's performance wear crafted for power, comfort, and unstoppable style.",
    cta: { label: "Shop Women's", to: '/products?category=women', secondary: 'New Arrivals', toSecondary: '/products?filter=new' },
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400&q=80',
    badge: { text: 'New Arrivals', color: '#22C55E' },
  },
  {
    id: 3,
    tag: 'BESTSELLER DROP',
    headline: ['PERFORMANCE', 'MEETS STYLE.'],
    accent: 'EXCLUSIVELY.',
    sub: "From the track to the street — Sportika's premium gear moves with you.",
    cta: { label: 'Shop Bestsellers', to: '/products?filter=bestselling', secondary: 'View Sale', toSecondary: '/products?filter=sale' },
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
    badge: { text: '🔥 Hot Picks', color: '#EF4444' },
  },
];

/* ─── Top Collections ─── */
const TOP_COLLECTIONS = [
  { name: 'New Arrivals', label: 'Fresh Picks', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', to: '/products?filter=new', bg: '#FF6B35' },
  { name: 'Under ₹499', label: 'Below 499', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', to: '/products?filter=sale', bg: '#1B1F3B' },
  { name: "Women's", label: "Women's Collection", img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80', to: '/products?category=women', bg: null },
  { name: 'Everyday', label: 'Everyday Essentials', img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80', to: '/products', bg: null },
  { name: 'Trending', label: 'Trending', img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80', to: '/products?filter=bestselling', bg: null },
  { name: 'Yoga', label: 'Yoga Collection', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', to: '/products?category=women', bg: null },
];

/* ─── Gender Categories ─── */
const GENDER_CATS = [
  { label: 'MEN', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', to: '/products?category=men', bg: '#E8EEF8' },
  { label: 'WOMEN', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80', to: '/products?category=women', bg: '#F8E8EE' },
  { label: 'KIDS', img: 'https://images.unsplash.com/photo-1535572290543-960a8046f5af?w=600&q=80', to: '/products', bg: '#FFF3E0' },
  { label: 'ACCESSORIES', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', to: '/products?sub=accessories', bg: '#F0F0F8' },
];

/* ─── Fabric Technologies ─── */
const FABRICS = [
  { icon: '❄️', name: 'CoolTech+', desc: 'Fabric tech that keeps you cool even in the toughest conditions.', to: '/products' },
  { icon: '🛡️', name: 'DuraFlex', desc: 'Rugged, lightweight fabric built for relentless movement.', to: '/products' },
  { icon: '🌿', name: 'CotFlex', desc: 'Feels like cotton, lasts like a champion.', to: '/products' },
  { icon: '☁️', name: 'CloudFlex', desc: 'Ultra-light fabric built for seamless movement.', to: '/products' },
  { icon: '❄️', name: 'DoubleCool', desc: 'Twice the cooling, twice the comfort.', to: '/products' },
  { icon: '💪', name: 'DuraCool+', desc: 'Durable fabric that also stays cool all day.', to: '/products' },
];

/* ─── Sub Categories ─── */
const SUB_CATS = [
  { name: 'T-Shirts', icon: '👕', to: '/products?sub=tshirts' },
  { name: 'Shorts', icon: '🩳', to: '/products?sub=shorts' },
  { name: 'Jackets', icon: '🧥', to: '/products?sub=jackets' },
  { name: 'Track Pants', icon: '👖', to: '/products?sub=track-pants' },
  { name: 'Shoes', icon: '👟', to: '/products?sub=shoes' },
  { name: 'Accessories', icon: '🎒', to: '/products?sub=accessories' },
  { name: 'Innerwear', icon: '🩲', to: '/products' },
  { name: 'Co-ord Sets', icon: '🎽', to: '/products' },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const countdown = useCountdown(SALE_END);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const [activeFilter, setActiveFilter] = useState<'featured' | 'new' | 'bestselling'>('featured');
  const allProducts = useProductStore(state => state.products);
  const featuredProducts = allProducts.filter(p => p.featured).slice(0, 4);
  const newArrivals = allProducts.filter(p => p.newArrival).slice(0, 4);
  const bestsellers = allProducts.filter(p => p.bestseller).slice(0, 4);

  const displayProducts = activeFilter === 'featured' ? featuredProducts
    : activeFilter === 'new' ? newArrivals
    : bestsellers;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
  };

  const goTo = (idx: number) => {
    setSlide(idx);
    resetTimer();
  };

  const handleNext = () => {
    setSlide((prev) => (prev + 1) % SLIDES.length);
    resetTimer();
  };

  const handlePrev = () => {
    setSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    resetTimer();
  };

  // Auto-scroll right every 5 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div>
      {/* ══════════════════════════════════════════════
          HERO — Full-width cinematic slider (5s auto right-scroll)
      ══════════════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Sliding Viewport */}
        <div style={{ position: 'relative', minHeight: '88vh', overflow: 'hidden' }}>
          {/* Horizontal Track that smoothly scrolls to the right */}
          <div
            style={{
              display: 'flex',
              width: `${SLIDES.length * 100}%`,
              transform: `translateX(-${(slide * 100) / SLIDES.length}%)`,
              transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
              minHeight: '88vh',
            }}
          >
            {SLIDES.map((s) => (
              <div
                key={s.id}
                style={{
                  position: 'relative',
                  width: `${100 / SLIDES.length}%`,
                  minHeight: '88vh',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* Background image */}
                <img
                  src={s.img}
                  alt={s.headline.join(' ')}
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center 25%',
                  }}
                />
                {/* Overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to right, rgba(27,31,59,0.92) 0%, rgba(27,31,59,0.65) 50%, rgba(27,31,59,0.2) 100%)',
                }} />

                {/* Content */}
                <div className="container" style={{ position: 'relative', zIndex: 2, minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
                  <div style={{ maxWidth: 680, padding: '80px 0' }}>
                    {/* Tag */}
                    <div className="hero-tag">
                      <Zap size={11} fill="#FF8F5B" /> {s.tag}
                    </div>

                    {/* Headline */}
                    <h1 style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 900,
                      fontStyle: 'italic',
                      color: 'white',
                      lineHeight: 0.92,
                      textTransform: 'uppercase',
                      margin: '0 0 20px',
                      fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
                      letterSpacing: '-0.01em',
                    }}>
                      {s.headline[0]}<br />
                      <span style={{
                        background: 'linear-gradient(90deg, #FF6B35 0%, #FFD60A 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        {s.headline[1]}
                      </span>
                    </h1>

                    {/* Subtext */}
                    <p style={{
                      color: 'rgba(255,255,255,0.78)',
                      fontSize: '1.05rem',
                      lineHeight: 1.7,
                      marginBottom: 36,
                      maxWidth: 500,
                    }}>
                      {s.sub}
                    </p>

                    {/* CTAs */}
                    <div className="hero-ctas">
                      <Link to={s.cta.to} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        background: 'white', color: '#1B1F3B',
                        fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.95rem',
                        padding: '14px 32px', borderRadius: 50, textDecoration: 'none',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FF6B35'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#1B1F3B'; e.currentTarget.style.transform = 'none'; }}
                      >
                        {s.cta.label} <ArrowRight size={17} />
                      </Link>
                      <Link to={s.cta.toSecondary} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                        color: 'white', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.95rem',
                        padding: '14px 28px', borderRadius: 50, textDecoration: 'none',
                        border: '1.5px solid rgba(255,255,255,0.3)',
                        transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'none'; }}
                      >
                        {s.cta.secondary}
                      </Link>
                    </div>

                    {/* Stats */}
                    <div className="hero-stats">
                      {[
                        { val: '50K+', lbl: 'Athletes' },
                        { val: '200+', lbl: 'Styles' },
                        { val: '4.8★', lbl: 'Rating' },
                        { val: 'PAN India', lbl: 'Delivery' },
                      ].map(stat => (
                        <div key={stat.lbl}>
                          <div className="hero-stat-val">{stat.val}</div>
                          <div className="hero-stat-lbl">{stat.lbl}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Slide badge */}
                <div style={{
                  position: 'absolute', top: 36, right: 40, zIndex: 10,
                  background: s.badge.color, color: 'white',
                  fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.95rem',
                  padding: '10px 22px', borderRadius: 50,
                  boxShadow: `0 6px 20px ${s.badge.color}60`,
                }}>
                  {s.badge.text}
                </div>
              </div>
            ))}
          </div>

          {/* Slider controls */}
          <div className="hero-controls">
            <button className="hero-arrow" onClick={handlePrev} aria-label="Previous slide">
              <ChevronLeft size={18} />
            </button>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === slide ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              >
                {i === slide && <span key={slide} className="hero-dot-fill" />}
              </button>
            ))}
            <button className="hero-arrow" onClick={handleNext} aria-label="Next slide">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Extra 5% off bar */}
        <div style={{
          background: 'linear-gradient(90deg, #FF6B35 0%, #E85A20 100%)',
          color: 'white', textAlign: 'center', padding: '13px 20px',
          fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.03em',
        }}>
          ⚡ EXTRA 5% OFF ON ORDERS ABOVE ₹1,599 — Use code <strong style={{ letterSpacing: 2 }}>SPORT5</strong>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BENEFITS BAR
      ══════════════════════════════════════════════ */}
      <div className="benefits-bar">
        <div className="benefits-inner">
          {[
            { icon: <Truck size={18} />, title: 'Free Shipping', sub: 'On all orders', color: '#22C55E' },
            { icon: <Tag size={18} />, title: 'Cash on Delivery', sub: 'On all orders', color: '#3D52D5' },
            { icon: <RefreshCw size={18} />, title: 'Easy Returns', sub: 'For 7 days', color: '#FF6B35' },
            { icon: <Shield size={18} />, title: 'High-Tech Fabric', sub: 'For everyday comfort', color: '#FFD60A' },
          ].map(item => (
            <div key={item.title} className="benefit-item">
              <div className="benefit-icon" style={{ color: item.color }}>{item.icon}</div>
              <div className="benefit-text">
                <strong>{item.title}</strong>
                <span>{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TOP COLLECTIONS — Horizontal scroll
      ══════════════════════════════════════════════ */}
      <section className="section" style={{ background: 'white', paddingBottom: 56 }}>
        <div className="container">
          <h2 className="section-title h1" style={{ textAlign: 'center', marginBottom: 36, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            TOP COLLECTIONS
          </h2>

          <div className="collections-scroll">
            {TOP_COLLECTIONS.map(cat => (
              <Link key={cat.to + cat.name} to={cat.to} className="collection-card" style={{ textDecoration: 'none' }}>
                <div className="collection-card-img" style={{ background: cat.bg || '#F5F6FA' }}>
                  {cat.bg ? (
                    /* Styled promo card */
                    <div style={{
                      width: '100%', height: '100%',
                      background: cat.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 20,
                    }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontStyle: 'italic',
                        fontWeight: 900,
                        fontSize: '1.6rem',
                        color: 'white',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        lineHeight: 1.1,
                      }}>
                        {cat.name}
                      </div>
                    </div>
                  ) : (
                    <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                  )}
                </div>
                <div className="collection-card-label">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          GENDER CATEGORY CARDS — 4 column grid
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#F5F6FA', padding: '56px 0' }}>
        <div className="container">
          <div className="gender-grid">
            {GENDER_CATS.map(cat => (
              <Link key={cat.to} to={cat.to} className="gender-card" style={{ background: cat.bg }}>
                <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', position: 'absolute', inset: 0 }} />
                <div className="gender-card-content">
                  <div className="gender-card-title">{cat.label}</div>
                  <div className="gender-card-btn">
                    Shop Now <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          NEW LAUNCHES — Promo + Products
      ══════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '0 0 64px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #E8EEF8 0%, #D0DBFF 100%)',
          padding: '24px 0',
          marginBottom: 40,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                background: '#FF6B35', color: 'white',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.72rem',
                padding: '6px 12px', borderRadius: 50, letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Zap size={11} fill="white" /> NEW ARRIVAL
              </div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(1.75rem, 4vw, 3rem)', color: '#1B1F3B', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                OUR NEW LAUNCHES
              </h2>
            </div>
            <Link to="/products?filter=new" style={{
              background: '#1B1F3B', color: 'white',
              fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem',
              padding: '12px 28px', borderRadius: 50, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#252A4A'}
              onMouseLeave={e => e.currentTarget.style.background = '#1B1F3B'}
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="container">
          <div className="products-grid">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SHOP BY CATEGORY — Sub-cat pills
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#F5F6FA', padding: '56px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 className="section-title h2" style={{ margin: 0 }}>Shop by Category</h2>
            <Link to="/products" className="btn btn-outline">View All <ChevronRight size={15} /></Link>
          </div>

          {/* Filter tabs */}
          <div className="filter-tabs" style={{ marginBottom: 28 }}>
            {(['Men', 'Women', 'Kids', 'Shoes & Accessories'] as const).map((tab, i) => {
              const keys = ['men', 'women', 'kids', 'accessories'];
              return (
                <Link key={tab} to={`/products${i < 2 ? `?category=${keys[i]}` : i === 3 ? '?sub=accessories' : ''}`}>
                  <button className={`filter-tab ${i === 0 ? 'active' : ''}`}>{tab}</button>
                </Link>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
            {SUB_CATS.map(cat => (
              <Link key={cat.to} to={cat.to} className="sub-cat-pill">
                <span className="sub-cat-pill-icon">{cat.icon}</span>
                <span className="sub-cat-pill-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FLASH SALE
      ══════════════════════════════════════════════ */}
      <section className="flash-sale-section">
        <div className="container">
          <div className="flash-sale-inner">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="flash-tag">
                <Zap size={12} fill="#FF6B35" /> FLASH SALE — LIMITED TIME
              </div>
              <h2 className="flash-title">
                Up to <span className="highlight">50% OFF</span> —<br />Gear That Goes the Distance
              </h2>
              <p className="flash-desc">
                Use code <strong style={{ color: '#FFD60A', letterSpacing: 2, fontFamily: 'Outfit' }}>FLASH50</strong> at checkout. Only while stocks last!
              </p>
              <Link to="/products?filter=sale" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'linear-gradient(135deg, #FF6B35, #FFD60A)',
                color: '#1B1F3B', fontFamily: 'Outfit', fontWeight: 900,
                padding: '13px 32px', borderRadius: 50, textDecoration: 'none', fontSize: '1rem',
                boxShadow: '0 8px 24px rgba(255,107,53,0.35)', transition: 'all 0.2s',
              }}>
                Shop Flash Sale <ArrowRight size={18} />
              </Link>
            </div>

            {/* Countdown */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Ends In</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[
                  { v: String(countdown.h).padStart(2, '0'), l: 'HRS' },
                  { v: String(countdown.m).padStart(2, '0'), l: 'MIN' },
                  { v: String(countdown.s).padStart(2, '0'), l: 'SEC' },
                ].map((unit, i) => (
                  <React.Fragment key={unit.l}>
                    {i > 0 && <div className="countdown-sep">:</div>}
                    <div className="countdown-box">
                      <div className="countdown-val">{unit.v}</div>
                      <div className="countdown-lbl">{unit.l}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED / BESTSELLERS — Tabbed
      ══════════════════════════════════════════════ */}
      <section className="section" style={{ background: '#F5F6FA' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div className="filter-tabs">
              {[
                { key: 'featured', label: '⭐ Featured' },
                { key: 'new', label: '⚡ New Arrivals' },
                { key: 'bestselling', label: '🔥 Bestsellers' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(tab.key as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Link to="/products" className="btn btn-outline">View All <ChevronRight size={15} /></Link>
          </div>
          <div className="products-grid" style={{ animation: 'fadeIn 0.35s ease' }}>
            {displayProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SHOP BY FABRIC — Technology Section
      ══════════════════════════════════════════════ */}
      <section className="fabric-section">
        <div className="fabric-section-bg-text">FABRICS</div>
        <div className="container">
          <h2 className="section-title h1" style={{ textAlign: 'center', marginBottom: 48, fontSize: 'clamp(1.75rem, 4vw, 3rem)', textTransform: 'uppercase', letterSpacing: '-0.01em', fontFamily: "'Barlow Condensed', sans-serif", fontStyle: 'italic' }}>
            SHOP BY FABRIC
          </h2>

          <div className="fabric-grid">
            {FABRICS.map(fab => (
              <Link key={fab.name} to={fab.to} className="fabric-card" style={{ textDecoration: 'none' }}>
                <div className="fabric-card-icon">{fab.icon}</div>
                <div>
                  <div className="fabric-card-title">{fab.name}</div>
                  <div className="fabric-card-desc">{fab.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#1B1F3B', color: 'white',
              fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem',
              padding: '14px 40px', borderRadius: 50, textDecoration: 'none',
              boxShadow: '0 8px 28px rgba(27,31,59,0.35)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(27,31,59,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(27,31,59,0.35)'; }}
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY SPORTIKA
      ══════════════════════════════════════════════ */}
      <section className="why-section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
            <div className="why-title-pill">
              WHY SPORTIKA?
            </div>
          </div>

          <div className="why-grid">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'Complimentary delivery on all orders, no minimum required.', color: '#22C55E' },
              { icon: '💳', title: 'Cash on Delivery', desc: 'Pay when your order arrives — no upfront worries.', color: '#3D52D5' },
              { icon: '↩️', title: 'Easy Returns', desc: 'Changed your mind? Return within 7 days, hassle-free.', color: '#FF6B35' },
              { icon: '🧵', title: 'High-Tech Fabric', desc: 'Performance fabrics engineered for your everyday comfort.', color: '#8B5CF6' },
            ].map(w => (
              <div key={w.title} className="why-card">
                <div className="why-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                  {w.icon}
                </div>
                <div className="why-card-title">{w.title}</div>
                <div className="why-card-desc">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow"><Star size={13} /> Customer Love</div>
            <h2 className="section-title h1">What Athletes Say</h2>
            <p className="section-subtitle">Trusted by 50,000+ athletes across India</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { name: 'Arjun Sharma', role: 'Marathon Runner, Mumbai', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 5, sport: '🏃', text: 'The Pro Runner T-Shirt is incredible. Wore it for my first marathon — 42km and still felt fresh. The moisture-wicking fabric is next level!' },
              { name: 'Priya Nair', role: 'CrossFit Athlete, Bangalore', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 5, sport: '💪', text: "Sportika's Power Leggings are a game-changer. High waist, perfect flex during WODs, and they still look brand new after 6 months of daily use." },
              { name: 'Rahul Desai', role: 'Football Coach, Pune', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', rating: 5, sport: '⚽', text: 'Ordered for my entire team — everyone is impressed. Premium quality at a great price. Delivery was super fast and customer service was excellent!' },
            ].map(r => (
              <div key={r.name} className="testimonial-card">
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{r.sport}</div>
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {Array.from({ length: r.rating }, (_, i) => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ color: '#4A5280', lineHeight: 1.75, fontSize: '0.875rem', marginBottom: 20 }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={r.avatar} alt={r.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E4E7F0' }} />
                  <div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem' }}>{r.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8B93B8' }}>{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(28px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
