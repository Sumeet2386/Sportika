import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, ShoppingBag, ArrowRight, Tag, X, ShieldCheck,
  Truck, RefreshCw, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { useCartStore, useAuthStore, useProductStore, useCouponStore } from '../store';
import ProductCard from '../components/ProductCard';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const { isAuthenticated } = useAuthStore();
  const allProducts = useProductStore((state) => state.products);
  const availableCoupons = useCouponStore((state) => state.coupons);
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = Math.max(0, subtotal + shipping + tax - couponDiscount);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // Free shipping progress calculation
  const shippingProgress = Math.min(100, Math.round((subtotal / 999) * 100));

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).toUpperCase().trim();
    if (!code) {
      setCouponError('Please enter a valid coupon code.');
      return;
    }

    const found = availableCoupons.find((c) => c.code === code && c.active);
    if (!found) {
      setCouponError(`Coupon "${code}" is invalid or expired.`);
      setCouponSuccess('');
      return;
    }

    if (subtotal < found.minOrder) {
      setCouponError(`Minimum cart subtotal of ₹${found.minOrder.toLocaleString('en-IN')} required for ${code}.`);
      setCouponSuccess('');
      return;
    }

    let discount = 0;
    if (found.type === 'percentage') {
      discount = Math.round((subtotal * found.value) / 100);
      if (found.maxDiscount) discount = Math.min(discount, found.maxDiscount);
    } else {
      discount = found.value;
    }

    applyCoupon(code, discount);
    setCouponError('');
    setCouponSuccess(`Coupon "${code}" applied! You save ₹${discount.toLocaleString('en-IN')}`);
    setCouponInput('');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  // Recommended products not in cart
  const suggested = allProducts
    .filter((p) => !items.some((i) => i.productId === p.id))
    .slice(0, 4);

  if (items.length === 0) {
    return (
      <div style={{ background: '#F8FAFF', minHeight: '85vh', padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: 'white', borderRadius: 28, padding: '56px 40px',
          border: '1px solid #E2E8F8', boxShadow: '0 4px 30px rgba(15,23,42,0.04)',
          maxWidth: 520, width: '100%', textAlign: 'center',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#EFF6FF', color: '#1565C0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <ShoppingBag size={40} />
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.8rem', color: '#0F172A', marginBottom: 10 }}>
            Your Cart is Empty
          </h1>
          <p style={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: 28 }}>
            Looks like you haven't added anything yet. Discover our premium performance gear engineered for champions.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/products" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Explore All Sportswear <ArrowRight size={18} />
            </Link>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
              <Link to="/products?category=men" style={{ fontSize: '0.85rem', color: '#1565C0', fontWeight: 700 }}>
                Men's Gear
              </Link>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <Link to="/products?category=women" style={{ fontSize: '0.85rem', color: '#1565C0', fontWeight: 700 }}>
                Women's Gear
              </Link>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <Link to="/size-guide" style={{ fontSize: '0.85rem', color: '#1565C0', fontWeight: 700 }}>
                Size Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFF', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0A0F1D 0%, #1565C0 100%)', color: 'white', padding: '40px 0 32px' }}>
        <div className="container" style={{ maxWidth: 1140 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={28} color="#60A5FA" />
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2rem', margin: 0 }}>
                  Review Your Cart
                </h1>
              </div>
              <p style={{ color: '#CBD5E1', margin: '6px 0 0', fontSize: '0.95rem' }}>
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} selected for your training session
              </p>
            </div>
            <Link
              to="/products"
              className="btn btn-outline"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '0.85rem' }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1140, paddingTop: 32 }}>
        <div className="cart-page-layout">
          {/* Left Column: Cart Items List */}
          <div>
            {/* Free Shipping Notification Bar */}
            <div style={{
              background: 'white', borderRadius: 18, padding: '16px 20px',
              border: '1px solid #E2E8F8', marginBottom: 20,
              boxShadow: '0 2px 10px rgba(15,23,42,0.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Outfit' }}>
                <span style={{ color: subtotal >= 999 ? '#059669' : '#1E40AF', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Truck size={16} />
                  {subtotal >= 999
                    ? '🎉 Congratulations! You have unlocked FREE Pan-India Shipping!'
                    : `Add ₹${(999 - subtotal).toLocaleString('en-IN')} more to qualify for FREE Shipping`}
                </span>
                <span style={{ color: '#64748B' }}>{shippingProgress}%</span>
              </div>
              <div className="cart-free-shipping-bar">
                <div
                  className="cart-free-shipping-progress"
                  style={{
                    width: `${shippingProgress}%`,
                    background: subtotal >= 999 ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #3B82F6, #1D4ED8)',
                  }}
                />
              </div>
            </div>

            {/* Cart Header Control */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                Cart Items ({items.length})
              </span>
              <button
                onClick={clearCart}
                style={{
                  background: 'none', border: 'none',
                  color: '#EF4444', fontSize: '0.82rem',
                  fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Trash2 size={14} /> Clear Cart
              </button>
            </div>

            {/* Items Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map((item) => {
                const itemImage =
                  item.product?.images?.[0] ||
                  (item.product as any)?.image ||
                  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80';
                const itemName = item.product?.name || 'Sportswear Item';
                const itemSlug = item.product?.slug || '';
                const itemPrice = item.price || item.product?.price || 0;
                const lineTotal = itemPrice * item.quantity;
                const colorObj = item.product?.colors?.find((c: any) => c.name === item.color);

                return (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="cart-page-item">
                    {/* Product Image */}
                    <Link
                      to={`/products/${itemSlug}`}
                      style={{
                        width: 100, height: 110, borderRadius: 14,
                        overflow: 'hidden', flexShrink: 0,
                        background: '#EEF2FF', border: '1px solid #E2E8F0',
                      }}
                    >
                      <img
                        src={itemImage}
                        alt={itemName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Link>

                    {/* Middle Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <Link
                            to={`/products/${itemSlug}`}
                            style={{
                              fontFamily: 'Outfit', fontWeight: 800,
                              fontSize: '1.05rem', color: '#0F172A',
                              textDecoration: 'none', lineHeight: 1.3,
                            }}
                          >
                            {itemName}
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                            <span style={{
                              background: '#EFF6FF', color: '#1565C0',
                              padding: '2px 8px', borderRadius: 6,
                              fontSize: '0.75rem', fontWeight: 800, fontFamily: 'Outfit',
                            }}>
                              Size: {item.size}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#64748B' }}>
                              <span
                                style={{
                                  width: 12, height: 12, borderRadius: '50%',
                                  background: colorObj?.hex || '#94A3B8',
                                  border: '1px solid rgba(0,0,0,0.1)',
                                }}
                              />
                              {item.color}
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          style={{
                            background: '#F8FAFC', border: '1px solid #E2E8F0',
                            color: '#94A3B8', cursor: 'pointer',
                            padding: 6, borderRadius: 8, transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#EF4444';
                            e.currentTarget.style.borderColor = '#FCA5A5';
                            e.currentTarget.style.background = '#FEF2F2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#94A3B8';
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.background = '#F8FAFC';
                          }}
                          title="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Stepper & Price Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          border: '1.5px solid #E2E8F8', borderRadius: 10,
                          overflow: 'hidden', background: '#F8FAFC',
                        }}>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                            style={{
                              width: 32, height: 32, background: 'white',
                              border: 'none', cursor: 'pointer',
                              fontFamily: 'Outfit', fontWeight: 800,
                              color: '#334155', fontSize: '1rem',
                            }}
                          >
                            −
                          </button>
                          <span style={{ minWidth: 36, textAlign: 'center', fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                            style={{
                              width: 32, height: 32, background: 'white',
                              border: 'none', cursor: 'pointer',
                              fontFamily: 'Outfit', fontWeight: 800,
                              color: '#334155', fontSize: '1rem',
                            }}
                          >
                            +
                          </button>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.15rem', color: '#1565C0' }}>
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </div>
                          {item.quantity > 1 && (
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              ₹{itemPrice.toLocaleString('en-IN')} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust Features Badges */}
            <div style={{
              marginTop: 24, padding: 20, background: 'white',
              borderRadius: 18, border: '1px solid #E2E8F8',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
            }}>
              {[
                { icon: <ShieldCheck size={20} color="#1565C0" />, title: '100% Genuine Apparel', desc: 'Direct from Sportika' },
                { icon: <RefreshCw size={20} color="#059669" />, title: '7-Day Easy Returns', desc: 'Hassle-free size exchange' },
                { icon: <Truck size={20} color="#D97706" />, title: 'Swift Dispatch', desc: 'Ships within 24-48 hours' },
              ].map((badge, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {badge.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', color: '#0F172A' }}>
                      {badge.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {badge.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div style={{
              background: 'white', borderRadius: 24, padding: '28px',
              border: '1px solid #E2E8F8', boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
            }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.35rem', color: '#0F172A', marginBottom: 20 }}>
                Order Summary
              </h2>

              {/* Coupon Section */}
              {couponCode ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', background: '#ECFDF5',
                  border: '1px solid #A7F3D0', borderRadius: 12, marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#065F46', fontSize: '0.875rem', fontWeight: 700 }}>
                    <Tag size={16} color="#059669" />
                    <span>"{couponCode}" Applied!</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>
                      -₹{couponDiscount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={removeCoupon}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 2 }}
                      title="Remove coupon"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="coupon-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6, fontFamily: 'Outfit' }}>
                    Have a Promo Code?
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      id="coupon-input"
                      type="text"
                      className="form-input"
                      placeholder="e.g. SPORT20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      style={{ flex: 1, textTransform: 'uppercase' }}
                    />
                    <button
                      className="btn btn-outline"
                      onClick={() => handleApplyCoupon()}
                      style={{ padding: '0 16px', fontWeight: 800, fontSize: '0.825rem' }}
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#DC2626', fontSize: '0.78rem', marginTop: 8 }}>
                      <AlertCircle size={14} /> {couponError}
                    </div>
                  )}

                  {couponSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16A34A', fontSize: '0.78rem', marginTop: 8 }}>
                      <CheckCircle2 size={14} /> {couponSuccess}
                    </div>
                  )}

                  {/* One-click quick coupons */}
                  <div style={{ marginTop: 12 }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>QUICK APPLY:</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                      {availableCoupons.filter((c) => c.active).slice(0, 3).map((cp) => (
                        <button
                          key={cp.id}
                          onClick={() => handleApplyCoupon(cp.code)}
                          style={{
                            background: '#F1F5F9', border: '1px dashed #CBD5E1',
                            borderRadius: 8, padding: '4px 10px',
                            fontSize: '0.75rem', fontWeight: 800,
                            fontFamily: 'Outfit', color: '#1565C0',
                            cursor: 'pointer', transition: 'all 0.15s ease',
                          }}
                        >
                          {cp.code} {cp.type === 'percentage' ? `(${cp.value}% off)` : `(₹${cp.value} off)`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Price Calculations */}
              <div style={{ borderTop: '1px solid #E2E8F8', paddingTop: 16 }}>
                <div className="cart-summary-row">
                  <span>Cart Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="cart-summary-row" style={{ color: '#059669' }}>
                    <span>Coupon Discount</span>
                    <span style={{ color: '#059669', fontWeight: 800 }}>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="cart-summary-row">
                  <span>Standard Shipping</span>
                  <span>{shipping === 0 ? <strong style={{ color: '#16A34A' }}>FREE</strong> : `₹${shipping}`}</span>
                </div>

                <div className="cart-summary-row">
                  <span>Estimated GST (5%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>

                <div className="cart-summary-row cart-total">
                  <span>Grand Total</span>
                  <span style={{ color: '#1565C0', fontSize: '1.4rem' }}>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="proceed-checkout"
                className="btn btn-primary btn-lg"
                onClick={handleCheckout}
                style={{
                  width: '100%', marginTop: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, fontWeight: 900, fontSize: '1.05rem',
                }}
              >
                Proceed to Checkout <ArrowRight size={20} />
              </button>

              {/* Payment Methods Info */}
              <div style={{ marginTop: 18, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Guaranteed Safe & Secure Checkout
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  <span>💳 UPI</span>
                  <span>•</span>
                  <span>🏦 Net Banking</span>
                  <span>•</span>
                  <span>💳 Debit/Credit Cards</span>
                  <span>•</span>
                  <span>💵 COD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {suggested.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Sparkles size={20} color="#1565C0" />
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.6rem', color: '#0F172A', margin: 0 }}>
                Athletes Also Purchased
              </h2>
            </div>
            <div className="products-grid">
              {suggested.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
