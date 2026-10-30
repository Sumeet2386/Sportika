import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye, Zap } from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore, useUIStore } from '../store';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [adding, setAdding] = useState(false);

  const { addItem } = useCartStore();
  const { items: wishItems, addItem: wishAdd, removeItem: wishRemove } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useUIStore();

  const isWished = wishItems.some(w => w.productId === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes.find(s => s.stock > 0)?.size || 'M';
    const defaultColor = product.colors[0];
    setAdding(true);
    setTimeout(() => setAdding(false), 900);
    addItem(product, defaultSize, defaultColor?.name || 'Standard', 1);
    addNotification('success', `${product.name} added to cart!`);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWished) {
      wishRemove(product.id);
      addNotification('info', 'Removed from wishlist');
    } else {
      wishAdd(product);
      addNotification('success', 'Added to wishlist ❤️');
    }
  };

  const stars = Math.round(product.rating);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="product-card"
      onMouseEnter={() => { setHovered(true); if (product.images[1]) setImgIdx(1); }}
      onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
      style={{ display: 'block', textDecoration: 'none' }}
      aria-label={product.name}
    >
      {/* Image */}
      <div className="product-card-img" style={{ position: 'relative' }}>
        <img
          src={product.images[imgIdx] || product.images[0]}
          alt={product.name}
          loading="lazy"
          style={{ transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)' }}
        />

        {/* Gradient overlay on hover */}
        <div style={{
          position: 'absolute', inset: 0, opacity: hovered ? 1 : 0,
          background: 'linear-gradient(to top, rgba(27,31,59,0.6) 0%, transparent 55%)',
          transition: 'opacity 0.3s ease',
        }} />

        {/* Wishlist btn */}
        <button
          className={`wishlist-btn${isWished ? ' active' : ''}`}
          onClick={toggleWishlist}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{ opacity: hovered || isWished ? 1 : 0 }}
        >
          <Heart size={15} fill={isWished ? '#EF4444' : 'none'} color={isWished ? '#EF4444' : '#4A5280'} />
        </button>

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5, zIndex: 2 }}>
          {product.discount > 0 && (
            <span className="product-badge product-badge-discount">{product.discount}% OFF</span>
          )}
          {product.newArrival && !product.discount && (
            <span className="product-badge product-badge-new">NEW</span>
          )}
          {product.bestseller && !product.newArrival && !product.discount && (
            <span className="product-badge product-badge-hot"><Zap size={9} fill="white" style={{ display: 'inline' }} /> HOT</span>
          )}
        </div>

        {/* Quick View overlay */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12, right: 12,
          display: 'flex', justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
          zIndex: 3,
        }}>
          <span
            style={{
              padding: '8px 16px', borderRadius: 50,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)', color: '#1B1F3B',
              fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.78rem',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
          >
            <Eye size={13} /> Quick View
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="product-card-body">
        <div className="product-card-brand">Sportika</div>
        <div className="product-card-name">{product.name}</div>

        {/* Rating */}
        <div className="product-card-rating">
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={11} fill={i < stars ? '#F59E0B' : 'none'} color={i < stars ? '#F59E0B' : '#D1D5DB'} />
            ))}
          </div>
          <span className="product-card-rating-text">{product.rating} ({product.reviewCount.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="product-card-price">
          <span className="product-card-price-current">₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="product-card-price-original">₹{product.originalPrice.toLocaleString()}</span>
          )}
          {product.discount > 0 && (
            <span className="product-card-price-discount">{product.discount}% off</span>
          )}
        </div>

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="product-card-colors">
            {product.colors.slice(0, 4).map(c => (
              <div key={c.hex} className="color-dot" style={{ background: c.hex }} title={c.name} />
            ))}
            {product.colors.length > 4 && (
              <span style={{ fontSize: '0.7rem', color: '#8B93B8', lineHeight: '15px' }}>+{product.colors.length - 4}</span>
            )}
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          style={{
            width: '100%', padding: '11px 16px',
            background: adding ? '#22C55E' : '#1B1F3B',
            color: 'white', border: 'none', borderRadius: 50,
            fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '0.83rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'all 0.25s ease',
            boxShadow: adding ? '0 4px 16px rgba(34,197,94,0.35)' : '0 4px 16px rgba(27,31,59,0.2)',
          }}
          onMouseEnter={e => { if (!adding) e.currentTarget.style.background = '#252A4A'; }}
          onMouseLeave={e => { if (!adding) e.currentTarget.style.background = '#1B1F3B'; }}
        >
          <ShoppingCart size={14} />
          {adding ? 'Added to Cart ✓' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
