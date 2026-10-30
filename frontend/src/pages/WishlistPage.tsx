import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, ShoppingCart, Trash2, ArrowRight, Star, CheckCircle,
  ShoppingBag, Sparkles, AlertCircle, ChevronRight
} from 'lucide-react';
import { useWishlistStore, useCartStore, useUIStore } from '../store';
import type { WishlistItem } from '../types';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const { addNotification } = useUIStore();
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleMoveToCart = (item: WishlistItem) => {
    setMovingId(item.productId);
    const defaultSize = item.product.sizes?.find((s) => s.stock > 0)?.size || 'M';
    const defaultColor = item.product.colors?.[0]?.name || 'Standard';

    addItem(item.product, defaultSize, defaultColor, 1);
    removeItem(item.productId);
    openCart();
    addNotification('success', `${item.product.name} moved to cart! 🛍️`);
    setTimeout(() => setMovingId(null), 500);
  };

  const handleMoveAllToCart = () => {
    const inStockItems = items.filter((item) => (item.product.stock || 0) > 0);
    if (inStockItems.length === 0) {
      addNotification('info', 'No in-stock items to move.');
      return;
    }

    inStockItems.forEach((item) => {
      const defaultSize = item.product.sizes?.find((s) => s.stock > 0)?.size || 'M';
      const defaultColor = item.product.colors?.[0]?.name || 'Standard';
      addItem(item.product, defaultSize, defaultColor, 1);
      removeItem(item.productId);
    });

    openCart();
    addNotification('success', `Moved ${inStockItems.length} items to your cart! 🚀`);
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      items.forEach((item) => removeItem(item.productId));
      addNotification('info', 'Wishlist cleared');
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 80 }}>
      {/* ── Breadcrumb & Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: 'white',
          padding: '36px 0 32px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="container">
          {/* Breadcrumb */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.8rem',
              color: '#94A3B8',
              marginBottom: 16,
            }}
          >
            <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#F1F5F9', fontWeight: 600 }}>Wishlist</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444',
                  }}
                >
                  <Heart size={22} fill="#EF4444" />
                </div>
                <div>
                  <h1
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 900,
                      fontSize: 'clamp(1.75rem, 3.5vw, 2.2rem)',
                      margin: 0,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    My Wishlist
                  </h1>
                  <span style={{ color: '#94A3B8', fontSize: '0.88rem' }}>
                    {items.length === 0
                      ? 'No items saved yet'
                      : `${items.length} ${items.length === 1 ? 'item' : 'items'} saved for later`}
                  </span>
                </div>
              </div>
            </div>

            {items.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleClearWishlist}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#CBD5E1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    padding: '10px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                    e.currentTarget.style.color = '#FCA5A5';
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#CBD5E1';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={handleMoveAllToCart}
                  style={{
                    background: '#FF6B35',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 22px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(255,107,53,0.35)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#EA580C')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FF6B35')}
                >
                  <ShoppingCart size={16} /> Move All to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="container" style={{ paddingTop: 36 }}>
        {items.length === 0 ? (
          /* Empty State */
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid #E2E8F0',
              padding: '64px 24px',
              textAlign: 'center',
              maxWidth: 560,
              margin: '32px auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#EF4444',
              }}
            >
              <Heart size={38} strokeWidth={1.5} />
            </div>
            <h2
              style={{
                fontFamily: 'Outfit',
                fontWeight: 800,
                fontSize: '1.6rem',
                color: '#0F172A',
                marginBottom: 8,
              }}
            >
              Your Wishlist is Empty
            </h2>
            <p
              style={{
                color: '#64748B',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                maxWidth: 400,
                margin: '0 auto 28px',
              }}
            >
              Save your favorite high-performance sportswear and apparel to shop anytime with exclusive member perks.
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#0F172A',
                color: 'white',
                padding: '14px 32px',
                borderRadius: 50,
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(15,23,42,0.2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FF6B35')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0F172A')}
            >
              Explore Products <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 24,
            }}
            className="wishlist-grid-container"
          >
            {items.map((item) => {
              const stars = Math.round(item.product.rating || 5);
              const isOutOfStock = (item.product.stock || 0) === 0;

              return (
                <div
                  key={item.productId}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 20,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  {/* Image Container with Fixed 4:5 Aspect Ratio */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '120%', // Clean 4:5 vertical fashion ratio
                      background: '#F1F5F9',
                      overflow: 'hidden',
                    }}
                  >
                    <Link
                      to={`/products/${item.product.slug}`}
                      style={{ position: 'absolute', inset: 0, display: 'block' }}
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center 20%',
                          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    </Link>

                    {/* Floating Badges */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        zIndex: 2,
                        pointerEvents: 'none',
                      }}
                    >
                      {item.product.discount > 0 && (
                        <span
                          style={{
                            background: '#FF6B35',
                            color: 'white',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: 50,
                            letterSpacing: '0.04em',
                            boxShadow: '0 2px 8px rgba(255,107,53,0.3)',
                          }}
                        >
                          {item.product.discount}% OFF
                        </span>
                      )}
                      {isOutOfStock && (
                        <span
                          style={{
                            background: '#475569',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: 6,
                          }}
                        >
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Quick Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem(item.productId);
                        addNotification('info', `Removed ${item.product.name} from wishlist`);
                      }}
                      title="Remove from wishlist"
                      aria-label="Remove item"
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #E2E8F0',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 3,
                        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEF2F2';
                        e.currentTarget.style.color = '#EF4444';
                        e.currentTarget.style.borderColor = '#FCA5A5';
                        e.currentTarget.style.transform = 'scale(1.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.currentTarget.style.color = '#64748B';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Card Content & Details */}
                  <div
                    style={{
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    {/* Brand */}
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#94A3B8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 4,
                      }}
                    >
                      {item.product.brand || 'Sportika'}
                    </div>

                    {/* Product Name */}
                    <Link
                      to={`/products/${item.product.slug}`}
                      style={{
                        textDecoration: 'none',
                        color: '#0F172A',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        lineHeight: 1.4,
                        minHeight: '2.8em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: 8,
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FF6B35')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#0F172A')}
                    >
                      {item.product.name}
                    </Link>

                    {/* Ratings */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < stars ? '#F59E0B' : 'none'}
                            color={i < stars ? '#F59E0B' : '#CBD5E1'}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>
                        {item.product.rating || 4.8}
                      </span>
                    </div>

                    {/* ── Perfectly Aligned Price Row ── */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 900,
                          fontSize: '1.25rem',
                          color: '#0F172A',
                        }}
                      >
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </span>

                      {item.product.originalPrice > item.product.price && (
                        <span
                          style={{
                            fontSize: '0.85rem',
                            color: '#94A3B8',
                            textDecoration: 'line-through',
                            fontWeight: 500,
                          }}
                        >
                          ₹{item.product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}

                      {item.product.discount > 0 && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#16A34A',
                            background: '#DCFCE7',
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {item.product.discount}% off
                        </span>
                      )}
                    </div>

                    {/* Stock Status & Date */}
                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 10,
                        borderTop: '1px solid #F1F5F9',
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: isOutOfStock ? '#EF4444' : '#22C55E',
                          }}
                        />
                        <span style={{ fontWeight: 600, color: isOutOfStock ? '#EF4444' : '#15803D' }}>
                          {isOutOfStock ? 'Sold Out' : 'In Stock'}
                        </span>
                      </div>
                      <span style={{ color: '#94A3B8' }}>
                        Saved {new Date(item.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* ── Action: Move to Cart ── */}
                    <div style={{ marginTop: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveToCart(item)}
                        disabled={isOutOfStock || movingId === item.productId}
                        style={{
                          width: '100%',
                          height: 44,
                          borderRadius: 12,
                          background: isOutOfStock ? '#E2E8F0' : '#0F172A',
                          color: isOutOfStock ? '#94A3B8' : 'white',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          border: 'none',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          transition: 'all 0.2s',
                          boxShadow: isOutOfStock ? 'none' : '0 4px 12px rgba(15,23,42,0.15)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isOutOfStock) {
                            e.currentTarget.style.background = '#FF6B35';
                            e.currentTarget.style.boxShadow = '0 6px 18px rgba(255,107,53,0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isOutOfStock) {
                            e.currentTarget.style.background = '#0F172A';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.15)';
                          }
                        }}
                      >
                        <ShoppingCart size={15} />
                        {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .wishlist-grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
