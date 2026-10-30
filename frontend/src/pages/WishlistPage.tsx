import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlistStore, useCartStore, useUIStore } from '../store';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const { addNotification } = useUIStore();

  const handleMoveToCart = (item: typeof items[0]) => {
    const defaultSize = item.product.sizes.find((s) => s.stock > 0)?.size || 'M';
    const defaultColor = item.product.colors[0]?.name || '';
    addItem(item.product, defaultSize, defaultColor, 1);
    removeItem(item.productId);
    openCart();
    addNotification('success', 'Moved to cart!');
  };

  return (
    <div style={{ background: '#F8FAFF', minHeight: '100vh', paddingBottom: 64 }}>
      <div style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: 'white', padding: '32px 0 24px' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Heart size={28} /> My Wishlist
            {items.length > 0 && (
              <span style={{ fontSize: '0.6em', fontWeight: 400, opacity: 0.8 }}>({items.length} items)</span>
            )}
          </h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        {items.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '5rem', marginBottom: 20 }}>💔</div>
            <div className="empty-state-title">Your Wishlist is Empty</div>
            <p style={{ marginBottom: 32, color: '#8896B3' }}>Save your favorite sportswear and shop them later!</p>
            <Link to="/products" className="btn btn-primary btn-lg">Explore Products</Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((item) => (
              <div key={item.productId} className="product-card">
                <Link to={`/products/${item.product.slug}`}>
                  <div className="product-card-image">
                    <img src={item.product.images[0]} alt={item.product.name} loading="lazy" />
                    {item.product.discount > 0 && (
                      <div className="product-card-badges">
                        <span className="badge badge-sale">{item.product.discount}% OFF</span>
                      </div>
                    )}
                    <div className="product-card-actions" style={{ opacity: 1, transform: 'none' }}>
                      <button
                        className="product-action-btn active"
                        onClick={(e) => { e.preventDefault(); removeItem(item.productId); addNotification('info', 'Removed from wishlist'); }}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="product-card-info">
                    <div className="product-brand">{item.product.brand}</div>
                    <div className="product-name">{item.product.name}</div>
                    <div className="product-price">
                      <span className="price-current">₹{item.product.price.toLocaleString('en-IN')}</span>
                      {item.product.originalPrice > item.product.price && (
                        <>
                          <span className="price-original">₹{item.product.originalPrice.toLocaleString('en-IN')}</span>
                          <span className="price-discount">{item.product.discount}% off</span>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#8896B3', marginTop: 4 }}>
                      Added {new Date(item.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </Link>
                <div className="product-card-footer">
                  <button
                    className="btn-add-cart"
                    onClick={() => handleMoveToCart(item)}
                    disabled={item.product.stock === 0}
                  >
                    <ShoppingCart size={15} />
                    {item.product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
