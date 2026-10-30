import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Star, Truck, Shield, RefreshCw,
  ChevronLeft, ChevronRight, Share2, Check, Minus, Plus, Info
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCartStore, useWishlistStore, useUIStore, useProductStore } from '../store';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const products = useProductStore((state) => state.products);
  const product = products.find((p) => p.slug === slug);
  const relatedProducts = products.filter((p) => p.id !== product?.id && p.category === product?.category).slice(0, 4);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'size-guide' | 'reviews'>('description');
  const [sizeError, setSizeError] = useState(false);

  const { addItem, openCart } = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const { addNotification } = useUIStore();

  if (!product) {
    return (
      <div className="empty-state" style={{ padding: '96px 0' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>😕</div>
        <div className="empty-state-title">Product not found</div>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Products</Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const selectedColorObj = product.colors.find((c) => c.name === selectedColor);
  const selectedSizeObj = product.sizes.find((s) => s.size === selectedSize);
  const maxStock = Math.min(selectedSizeObj?.stock || product.stock, 10);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setSizeError(false);
    addItem(product, selectedSize, selectedColor, quantity);
    openCart();
    addNotification('success', `${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); return; }
    addItem(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addNotification('info', 'Product link copied!');
    }
  };

  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`;
  const savings = product.originalPrice - product.price;

  return (
    <div style={{ background: '#F8FAFF', minHeight: '100vh', paddingBottom: 64 }}>
      <div className="container" style={{ paddingTop: 32 }}>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/products">Products</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to={`/products?category=${product.category}`} style={{ textTransform: 'capitalize' }}>
            {product.category}'s
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        {/* Product Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 2px 12px rgba(21,101,192,0.08)', border: '1px solid #E2E8F8' }}>
          {/* Image Gallery */}
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className={`product-thumb ${activeImage === i ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div style={{ flex: 1 }}>
              <div
                className="product-image-main"
                style={{ borderRadius: 20, overflow: 'hidden', background: '#EEF2FF', aspectRatio: '4/5' }}
              >
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => setActiveImage((p) => (p - 1 + product.images.length) % product.images.length)}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E2E8F8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: activeImage === i ? '#1565C0' : '#E2E8F8',
                        border: 'none', cursor: 'pointer'
                      }}
                    />
                  ))}
                  <button
                    onClick={() => setActiveImage((p) => (p + 1) % product.images.length)}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E2E8F8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Brand & Name */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span className="badge badge-primary">{product.brand}</span>
              <button onClick={handleShare} className="icon-btn" aria-label="Share">
                <Share2 size={18} />
              </button>
            </div>

            <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.75rem', marginBottom: 12, color: '#0D1117' }}>
              {product.name}
            </h1>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {product.newArrival && <span className="badge badge-new">✨ New Arrival</span>}
              {product.bestseller && <span className="badge badge-hot">🔥 Bestseller</span>}
              {product.discount > 0 && <span className="badge badge-sale">{product.discount}% OFF</span>}
              {product.stock < 10 && product.stock > 0 && (
                <span className="badge" style={{ background: '#FFF3E0', color: '#FF6F00' }}>
                  Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.rating) ? '#F59E0B' : 'none'} color="#F59E0B" />
                ))}
              </div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#0D1117' }}>{product.rating}</span>
              <span style={{ color: '#8896B3', fontSize: '0.875rem' }}>({product.reviewCount.toLocaleString()} reviews)</span>
              <span style={{ color: '#2ECC71', fontSize: '0.875rem', fontWeight: 600 }}>· {product.sold.toLocaleString()} sold</span>
            </div>

            {/* Price */}
            <div style={{ background: '#F8FAFF', borderRadius: 12, padding: 16, marginBottom: 24, border: '1px solid #E2E8F8' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2rem', color: '#1565C0' }}>
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span style={{ textDecoration: 'line-through', color: '#8896B3', fontSize: '1.1rem' }}>
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <div style={{ color: '#2ECC71', fontWeight: 600, fontSize: '0.875rem' }}>
                  You save {formatPrice(savings)} ({product.discount}% off)
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: '#8896B3', marginTop: 4 }}>
                Inclusive of all taxes · Free shipping above ₹999
              </div>
            </div>

            {/* Color Selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem' }}>
                  Color: <span style={{ color: '#1565C0' }}>{selectedColor}</span>
                </span>
              </div>
              <div className="color-selector">
                {product.colors.map((color) => (
                  <div
                    key={color.name}
                    className={`color-option ${selectedColor === color.name ? 'active' : ''}`}
                    style={{
                      backgroundColor: color.hex,
                      border: color.hex === '#F5F5F5' ? '1px solid #E2E8F8' : 'none',
                      opacity: color.stock === 0 ? 0.3 : 1
                    }}
                    title={`${color.name}${color.stock === 0 ? ' (Out of Stock)' : ''}`}
                    onClick={() => { if (color.stock > 0) setSelectedColor(color.name); }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div style={{ marginBottom: 24 }} id="size-selector">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem' }}>
                  Size {selectedSize && <span style={{ color: '#1565C0' }}>: {selectedSize}</span>}
                </span>
                <Link to="/size-guide" style={{ fontSize: '0.8rem', color: '#1565C0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Info size={13} /> Size Guide
                </Link>
              </div>
              {sizeError && (
                <p style={{ color: '#E74C3C', fontSize: '0.8rem', marginBottom: 8, fontWeight: 500 }}>
                  ⚠️ Please select a size to continue
                </p>
              )}
              <div className="size-grid">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    className={`size-option ${selectedSize === s.size ? 'active' : ''} ${s.stock === 0 ? 'unavailable' : ''}`}
                    onClick={() => { if (s.stock > 0) { setSelectedSize(s.size); setSizeError(false); } }}
                    disabled={s.stock === 0}
                    title={s.stock === 0 ? 'Out of stock' : `${s.stock} available`}
                  >
                    {s.size}
                    {s.stock > 0 && s.stock <= 3 && (
                      <span style={{ fontSize: '0.6rem', color: '#FF6F00' }}>!</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid #E2E8F8', borderRadius: 10, overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFF', border: 'none', cursor: 'pointer' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: 36, textAlign: 'center', fontFamily: 'Outfit', fontWeight: 700 }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFF', border: 'none', cursor: 'pointer' }}
                >
                  <Plus size={14} />
                </button>
              </div>
              {maxStock <= 5 && (
                <span style={{ fontSize: '0.775rem', color: '#FF6F00', fontWeight: 500 }}>
                  Only {maxStock} left in stock
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                  style={{ flex: 1 }}
                  id={`add-cart-detail-${product.id}`}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button
                  className={`btn btn-icon ${wishlisted ? 'btn-secondary' : 'btn-ghost'}`}
                  onClick={() => {
                    toggleItem(product);
                    addNotification('info', wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
                  }}
                  aria-label="Wishlist"
                  title="Add to Wishlist"
                >
                  <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
              <button
                className="btn btn-secondary btn-lg"
                onClick={handleBuyNow}
                id={`buy-now-${product.id}`}
              >
                ⚡ Buy Now
              </button>
            </div>

            {/* Delivery & Trust */}
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <Truck size={15} />, text: 'Free delivery on orders above ₹999 · Est. 3-5 days' },
                { icon: <RefreshCw size={15} />, text: '30-day easy return & exchange policy' },
                { icon: <Shield size={15} />, text: '100% authentic products · Quality guaranteed' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: '#3D4A6B' }}>
                  <span style={{ color: '#2ECC71' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Size Guide / Reviews */}
        <div style={{ marginTop: 32, background: 'white', borderRadius: 20, border: '1px solid #E2E8F8', overflow: 'hidden' }}>
          {/* Tab Headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F8' }}>
            {[
              { key: 'description', label: 'Description' },
              { key: 'size-guide', label: 'Size Guide' },
              { key: 'reviews', label: `Reviews (${product.reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1, padding: '16px 24px',
                  fontFamily: 'Outfit', fontWeight: 700,
                  fontSize: '0.9rem', border: 'none', background: 'none',
                  color: activeTab === tab.key ? '#1565C0' : '#8896B3',
                  borderBottom: activeTab === tab.key ? '2px solid #1565C0' : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: 32 }}>
            {activeTab === 'description' && (
              <div>
                <p style={{ color: '#3D4A6B', lineHeight: 1.8, marginBottom: 20 }}>{product.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {[
                    { label: 'Material', value: '88% Polyester, 12% Spandex' },
                    { label: 'Fit', value: 'Athletic / Performance Fit' },
                    { label: 'Care', value: 'Machine wash cold, do not tumble dry' },
                    { label: 'Origin', value: 'Made in India' },
                    { label: 'SKU', value: `SPT-${product.id.padStart(6, '0')}` },
                    { label: 'Category', value: `${product.category === 'men' ? "Men's" : "Women's"} · ${product.subcategory}` },
                  ].map((item) => (
                    <div key={item.label} style={{ padding: '12px 16px', background: '#F8FAFF', borderRadius: 10 }}>
                      <div style={{ fontSize: '0.75rem', color: '#8896B3', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0D1117' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {product.tags.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: '0.75rem', color: '#8896B3', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Tags</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {product.tags.map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'size-guide' && (
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 16 }}>Size Chart</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ minWidth: 400 }}>
                    <thead>
                      <tr>
                        {['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)', 'Height (cm)'].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['XS', '32-34', '26-28', '34-36', '155-160'],
                        ['S', '34-36', '28-30', '36-38', '160-165'],
                        ['M', '36-38', '30-32', '38-40', '165-170'],
                        ['L', '38-40', '32-34', '40-42', '170-175'],
                        ['XL', '40-42', '34-36', '42-44', '175-180'],
                        ['XXL', '42-44', '36-38', '44-46', '180-185'],
                      ].map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, i) => (
                            <td key={i} style={{ fontWeight: i === 0 ? 700 : 400 }}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={{ color: '#8896B3', fontSize: '0.8rem', marginTop: 12 }}>
                  * Measurements are approximate. For the best fit, measure your body and refer to the chart above.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
                  {/* Rating Summary */}
                  <div style={{ textAlign: 'center', minWidth: 120 }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '3rem', color: '#0D1117' }}>
                      {product.rating}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 4 }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={18} fill={i < Math.floor(product.rating) ? '#F59E0B' : 'none'} color="#F59E0B" />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8896B3' }}>{product.reviewCount.toLocaleString()} reviews</div>
                  </div>

                  {/* Rating Bars */}
                  <div style={{ flex: 1 }}>
                    {[5, 4, 3, 2, 1].map((r) => {
                      const pct = r === 5 ? 70 : r === 4 ? 20 : r === 3 ? 7 : r === 2 ? 2 : 1;
                      return (
                        <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: '0.8rem', width: 12 }}>{r}</span>
                          <Star size={12} fill="#F59E0B" color="#F59E0B" />
                          <div style={{ flex: 1, height: 8, background: '#E2E8F8', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#8896B3', width: 32 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sample Reviews */}
                {[
                  { name: 'Ankit M.', rating: 5, text: 'Amazing quality! Wore it for my morning run and it was super comfortable. The fabric is breathable and wicks away sweat really well. Will definitely buy more.', date: '15 Oct 2024', verified: true },
                  { name: 'Sneha P.', rating: 4, text: 'Great product overall. Fits true to size. The color is exactly as shown. Shipping was a bit slow but worth the wait!', date: '2 Oct 2024', verified: true },
                  { name: 'Rohit K.', rating: 5, text: 'Best sportswear I\'ve bought in years. The quality is premium and you can feel the difference from cheaper brands. Highly recommended!', date: '28 Sep 2024', verified: false },
                ].map((review, i) => (
                  <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid #E2E8F8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1565C0, #FF6F00)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.875rem'
                        }}>
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Outfit' }}>
                            {review.name}
                            {review.verified && (
                              <span style={{ color: '#2ECC71', fontSize: '0.7rem', fontWeight: 500, marginLeft: 6 }}>
                                ✓ Verified Purchase
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} size={11} fill={i < review.rating ? '#F59E0B' : 'none'} color="#F59E0B" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#8896B3' }}>{review.date}</span>
                    </div>
                    <p style={{ color: '#3D4A6B', fontSize: '0.875rem', lineHeight: 1.6 }}>{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 24 }}>You May Also Like</h2>
            <div className="products-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
