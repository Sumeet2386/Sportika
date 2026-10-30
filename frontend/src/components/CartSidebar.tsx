import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '../store';

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    couponCode,
    couponDiscount,
  } = useCartStore();

  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const discount = couponDiscount;
  const total = Math.max(0, subtotal + shipping + tax - discount);
  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Progress towards free shipping (₹999)
  const shippingProgress = Math.min(100, Math.round((subtotal / 999) * 100));

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />

      {/* Sidebar Drawer */}
      <aside
        className={`cart-sidebar ${isOpen ? 'open' : ''}`}
        id="cart-sidebar"
        role="dialog"
        aria-label="Shopping Cart"
      >
        {/* Header */}
        <div className="cart-sidebar-header">
          <div className="cart-sidebar-title">
            <ShoppingBag size={22} color="#1565C0" />
            <span>Shopping Cart</span>
            {totalItemCount > 0 && (
              <span
                style={{
                  background: '#1565C0',
                  color: 'white',
                  borderRadius: 50,
                  padding: '2px 9px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                }}
              >
                {totalItemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: 10,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Milestone Banner */}
        {items.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              background: subtotal >= 999 ? '#ECFDF5' : '#EFF6FF',
              borderBottom: '1px solid #E2E8F8',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: subtotal >= 999 ? '#065F46' : '#1E40AF',
                fontFamily: 'Outfit',
              }}
            >
              <span>
                {subtotal >= 999 ? '🎉 You unlocked FREE Shipping!' : `Add ₹${999 - subtotal} more for FREE shipping`}
              </span>
              <span>{shippingProgress}%</span>
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
        )}

        {/* Cart Items List */}
        <div className="cart-sidebar-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div style={{ fontSize: '4rem', marginBottom: 12 }}>🛒</div>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', marginBottom: 6 }}>
                Your cart is empty
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: 260, margin: '0 auto 24px' }}>
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link
                to="/products"
                onClick={closeCart}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                Start Shopping <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            items.map((item) => {
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
                <div key={`${item.productId}-${item.size}-${item.color}`} className="cart-item">
                  {/* Thumbnail */}
                  <Link
                    to={`/products/${itemSlug}`}
                    onClick={closeCart}
                    style={{ flexShrink: 0, textDecoration: 'none' }}
                  >
                    <img
                      src={itemImage}
                      alt={itemName}
                      className="cart-item-img"
                    />
                  </Link>

                  {/* Info */}
                  <div className="cart-item-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <Link
                        to={`/products/${itemSlug}`}
                        onClick={closeCart}
                        className="cart-item-name"
                        style={{ textDecoration: 'none' }}
                      >
                        {itemName}
                      </Link>
                      <button
                        className="cart-remove"
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        aria-label={`Remove ${itemName}`}
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Metadata pill */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: '0.78rem',
                        color: '#64748B',
                        margin: '4px 0 10px',
                      }}
                    >
                      <span
                        style={{
                          background: '#F1F5F9',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontFamily: 'Outfit',
                          color: '#334155',
                        }}
                      >
                        {item.size}
                      </span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: colorObj?.hex || '#94A3B8',
                            display: 'inline-block',
                            border: '1px solid rgba(0,0,0,0.1)',
                          }}
                        />
                        {item.color}
                      </span>
                    </div>

                    {/* Quantity & Price Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {/* Stepper */}
                      <div className="cart-item-qty">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Price */}
                      <div style={{ textAlign: 'right' }}>
                        <div className="cart-item-price">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </div>
                        {item.quantity > 1 && (
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                            ₹{itemPrice.toLocaleString('en-IN')} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="cart-sidebar-footer">
            {/* Active Coupon notification */}
            {couponCode && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: 10,
                  marginBottom: 14,
                  fontSize: '0.8rem',
                  color: '#065F46',
                  fontWeight: 600,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag size={14} color="#059669" />
                  <span>Coupon <strong>"{couponCode}"</strong> applied!</span>
                </div>
                <span style={{ fontWeight: 800, color: '#059669' }}>
                  -₹{couponDiscount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {discount > 0 && (
              <div className="cart-summary-row" style={{ color: '#059669' }}>
                <span>Coupon Savings</span>
                <span style={{ color: '#059669' }}>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="cart-summary-row">
              <span>Estimated Shipping</span>
              <span>{shipping === 0 ? <strong style={{ color: '#16A34A' }}>FREE</strong> : `₹${shipping}`}</span>
            </div>

            <div className="cart-summary-row">
              <span>Estimated GST (5%)</span>
              <span>₹{tax.toLocaleString('en-IN')}</span>
            </div>

            <div className="cart-summary-row cart-total">
              <span>Total Amount</span>
              <span style={{ color: '#1565C0' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/checkout');
                }}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontWeight: 800,
                }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <button
                onClick={() => {
                  closeCart();
                  navigate('/cart');
                }}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                View & Edit Full Cart
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
