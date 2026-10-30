import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, CreditCard, Truck, CheckCircle2, Plus, QrCode, Shield, ShieldCheck, Lock,
  ArrowRight, ArrowLeft, Check, Sparkles, X, Tag, AlertCircle
} from 'lucide-react';
import { useCartStore, useAuthStore, useOrderStore, useProductStore, useUIStore, useCouponStore } from '../store';
import type { Address } from '../types';

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'razorpay' | 'cod'>('upi');

  // Payment Form States
  const [upiId, setUpiId] = useState('sumeet@okaxis');
  const [cardForm, setCardForm] = useState({
    number: '4532 •••• •••• 8821',
    name: 'Sumeet Gite',
    expiry: '10/28',
    cvv: '890',
  });

  // New Address Inline Modal
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<Address, 'id'>>({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    country: 'India',
    isDefault: false,
    type: 'home',
  });

  // Placed Order info
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Stores
  const { items, getSubtotal, couponCode, couponDiscount, clearCart, applyCoupon, removeCoupon } = useCartStore();
  const availableCoupons = useCouponStore((state) => state.coupons);
  const { user, addAddress } = useAuthStore();
  const { createOrder } = useOrderStore();
  const { decrementStock } = useProductStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  const [checkoutCouponInput, setCheckoutCouponInput] = useState('');
  const [checkoutCouponError, setCheckoutCouponError] = useState('');
  const [checkoutCouponSuccess, setCheckoutCouponSuccess] = useState('');

  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = Math.max(0, subtotal + shipping + tax - couponDiscount);

  const handleApplyCheckoutCoupon = (codeToApply?: string) => {
    const code = (codeToApply || checkoutCouponInput).toUpperCase().trim();
    if (!code) {
      setCheckoutCouponError('Please enter a coupon code.');
      return;
    }
    const found = availableCoupons.find((c) => c.code === code && c.active);
    if (!found) {
      setCheckoutCouponError(`Coupon "${code}" is invalid or expired.`);
      setCheckoutCouponSuccess('');
      return;
    }
    if (subtotal < found.minOrder) {
      setCheckoutCouponError(`Min. cart subtotal of ₹${found.minOrder.toLocaleString('en-IN')} required for ${code}.`);
      setCheckoutCouponSuccess('');
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
    setCheckoutCouponError('');
    setCheckoutCouponSuccess(`Coupon "${code}" applied! You save ₹${discount.toLocaleString('en-IN')}`);
    setCheckoutCouponInput('');
  };

  const addresses = user?.addresses || [];
  const currentAddress = addresses[selectedAddressIndex] || addresses[0];

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.name || !newAddr.phone || !newAddr.line1 || !newAddr.city || !newAddr.pincode) {
      addNotification('error', 'Please fill in all required address fields.');
      return;
    }
    const created = addAddress(newAddr);
    addNotification('success', 'Address added and selected for delivery!');
    setIsAddAddressOpen(false);
    setSelectedAddressIndex(addresses.length);
  };

  const handlePlaceOrder = async () => {
    if (!currentAddress) {
      addNotification('error', 'Please add or select a delivery address first.');
      setStep(1);
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    // Prepare items for Order
    const orderItems = items.map((i) => ({
      productId: i.productId,
      product: i.product,
      name: i.product.name,
      image: i.product.images[0] || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      price: i.price,
      originalPrice: i.product.originalPrice || i.price,
    }));

    // Create Order in live Order Store
    const placed = createOrder({
      items: orderItems,
      address: currentAddress,
      paymentMethod,
      subtotal,
      discount: couponDiscount,
      shipping,
      tax,
      total,
      couponCode: couponCode || undefined,
    });

    // Reduce stock in live Product Store
    items.forEach((i) => {
      decrementStock(i.productId, i.quantity);
    });

    // Clear user cart
    clearCart();

    setPlacedOrderNumber(placed.orderNumber);
    setOrderPlaced(true);
    setLoading(false);
    addNotification('success', `Order #${placed.orderNumber} placed successfully! 🎉`);
  };

  // If order was successfully placed
  if (orderPlaced) {
    return (
      <div style={{ minHeight: '85vh', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          background: 'white', borderRadius: 28, padding: 48, maxWidth: 540, width: '100%',
          textAlign: 'center', boxShadow: '0 12px 50px rgba(21,101,192,0.12)', border: '1px solid #E2E8F8'
        }}>
          <div style={{
            width: 84, height: 84, background: '#DCFCE7', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            color: '#16A34A', boxShadow: '0 4px 16px rgba(22,163,74,0.2)'
          }}>
            <CheckCircle2 size={48} />
          </div>

          <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2rem', marginBottom: 8, color: '#0F172A' }}>
            Order Confirmed! 🎉
          </h2>
          <p style={{ color: '#64748B', marginBottom: 12, fontSize: '0.95rem' }}>
            Thank you for choosing Sportika Global Sportswear!
          </p>
          <div style={{ display: 'inline-block', background: '#EFF6FF', borderRadius: 50, padding: '6px 18px', color: '#1565C0', fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.05rem', marginBottom: 24 }}>
            Order #{placedOrderNumber}
          </div>

          <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 28, fontSize: '0.875rem', color: '#475569', lineHeight: 1.7, textAlign: 'left', border: '1px solid #E2E8F8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Delivery To:</span>
              <strong style={{ color: '#0F172A' }}>{currentAddress?.name} ({currentAddress?.city})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Payment Mode:</span>
              <strong style={{ textTransform: 'uppercase', color: '#0F172A' }}>{paymentMethod}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated Delivery:</span>
              <strong style={{ color: '#16A34A' }}>3-4 Business Days via BlueDart</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/orders" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Track My Live Shipment <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="btn btn-ghost">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guard against empty checkout
  if (items.length === 0 && !orderPlaced) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFF', padding: 48 }}>
        <div style={{ fontSize: '4.5rem', marginBottom: 16 }}>🛍️</div>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', marginBottom: 10 }}>Your Checkout Bag is Empty</h2>
        <p style={{ color: '#64748B', marginBottom: 24 }}>Add some high-performance sportswear to begin checkout.</p>
        <Link to="/products" className="btn btn-primary btn-lg">Browse Collection</Link>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Delivery Address', subtitle: 'Shipping destination' },
    { num: 2, label: 'Payment Options', subtitle: 'UPI, Cards, or COD' },
    { num: 3, label: 'Review & Place', subtitle: 'Verify & dispatch' },
  ];

  return (
    <div style={{ background: '#F8FAFF', minHeight: '100vh', paddingBottom: 64 }}>
      {/* Top Banner */}
      <div className="checkout-header-banner">
        <div className="container" style={{ maxWidth: 1140 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                padding: '4px 12px', borderRadius: 50,
                fontSize: '0.75rem', fontWeight: 700, color: '#6EE7B7', marginBottom: 10
              }}>
                <Lock size={12} color="#34D399" />
                <span>256-Bit Bank-Grade Encrypted</span>
              </div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(1.75rem, 3.5vw, 2.3rem)', margin: 0, letterSpacing: '-0.02em' }}>
                Express Secure Checkout
              </h1>
              <p style={{ color: '#CBD5E1', fontSize: '0.9rem', margin: '6px 0 0' }}>
                Complete your order in 3 simple steps · Fast dispatch within 24-48 hrs
              </p>
            </div>

            <Link
              to="/cart"
              className="btn btn-outline"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '0.825rem', padding: '8px 16px' }}
            >
              ← Back to Cart
            </Link>
          </div>

          {/* Stepper */}
          <div className="checkout-steps">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div
                  className={`checkout-step ${step === s.num ? 'active' : step > s.num ? 'completed' : ''} ${step > s.num ? 'clickable' : ''}`}
                  onClick={() => step > s.num && setStep(s.num as Step)}
                >
                  <div className="step-number">
                    {step > s.num ? <Check size={18} strokeWidth={3} /> : s.num}
                  </div>
                  <div className="step-info">
                    <span className="step-title">
                      {s.label}
                    </span>
                    <span className="step-subtitle">
                      {s.subtitle}
                    </span>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`step-connector ${step > s.num ? 'completed' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1140, paddingTop: 32 }}>
        <div className="checkout-page-layout">
          {/* Main Checkout Box */}
          <div>
            {/* ─── STEP 1: ADDRESS ─── */}
            {step === 1 && (
              <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid #E2E8F8', boxShadow: '0 2px 14px rgba(27,31,59,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <MapPin size={22} color="#1565C0" /> 1. Select Delivery Address
                    </h2>
                    <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Where should we deliver your Sportika athletic gear?</p>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setNewAddr({
                        name: user?.name || '',
                        phone: user?.phone || '',
                        line1: '',
                        line2: '',
                        city: 'Pune',
                        state: 'Maharashtra',
                        pincode: '411001',
                        country: 'India',
                        isDefault: addresses.length === 0,
                        type: 'home',
                      });
                      setIsAddAddressOpen(true);
                    }}
                    id="checkout-add-address-btn"
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', background: '#F8FAFC', borderRadius: 16, border: '1.5px dashed #CBD5E1', marginBottom: 20 }}>
                    <p style={{ color: '#64748B', marginBottom: 16 }}>No delivery address found on your account.</p>
                    <button className="btn btn-primary" onClick={() => setIsAddAddressOpen(true)}>+ Enter Address</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                    {addresses.map((addr, i) => (
                      <div
                        key={addr.id}
                        className={`payment-option ${selectedAddressIndex === i ? 'active' : ''}`}
                        onClick={() => setSelectedAddressIndex(i)}
                        style={{ cursor: 'pointer', padding: 18, borderRadius: 16 }}
                      >
                        <input
                          type="radio"
                          name="addressRadio"
                          checked={selectedAddressIndex === i}
                          onChange={() => setSelectedAddressIndex(i)}
                          style={{ marginTop: 4 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                              {addr.name}
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {addr.isDefault && <span className="badge badge-primary">Default</span>}
                              <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#E2E8F0', color: '#475569' }}>
                                {addr.type}
                              </span>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                            {addr.city}, {addr.state} — <strong>{addr.pincode}</strong><br />
                            📞 Contact: {addr.phone}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => setStep(2)}
                  disabled={addresses.length === 0}
                  id="continue-to-payment-btn"
                >
                  Proceed to Payment Options <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* ─── STEP 2: PAYMENT ─── */}
            {step === 2 && (
              <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid #E2E8F8', boxShadow: '0 2px 14px rgba(27,31,59,0.03)' }}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.35rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CreditCard size={22} color="#1565C0" /> 2. Choose Payment Method
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 24 }}>
                  All transactions are 100% encrypted with RBI & PCI-DSS 256-bit security.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                  {/* Option: UPI */}
                  <div
                    className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                    style={{ cursor: 'pointer', padding: 18, borderRadius: 16 }}
                  >
                    <input type="radio" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                    <span style={{ fontSize: '1.6rem' }}>📱</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                        UPI Instant (GPay / PhonePe / Paytm / BHIM)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Fastest payment with zero surcharge. Scan QR or enter VPA ID.
                      </div>
                    </div>
                  </div>

                  {/* Sub-form: UPI */}
                  {paymentMethod === 'upi' && (
                    <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 20, border: '1px solid #E2E8F8', marginLeft: 28 }}>
                      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Simulated QR */}
                        <div style={{
                          width: 110, height: 110, background: 'white', borderRadius: 12, padding: 8,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          border: '1.5px solid #CBD5E1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <QrCode size={70} color="#1565C0" />
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1565C0', marginTop: 4 }}>SCAN & PAY</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <label className="form-label" style={{ fontSize: '0.8rem' }}>Enter Your UPI ID / VPA</label>
                          <input
                            type="text"
                            className="form-input"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@okhdfcbank"
                            style={{ fontSize: '0.875rem' }}
                            id="checkout-upi-id"
                          />
                          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                            {['@okaxis', '@okhdfcbank', '@paytm', '@ybl'].map((suf) => (
                              <button
                                key={suf}
                                type="button"
                                onClick={() => setUpiId((v) => (v.split('@')[0] || 'sumeet') + suf)}
                                style={{
                                  background: 'white', border: '1px solid #CBD5E1', borderRadius: 6,
                                  padding: '3px 8px', fontSize: '0.725rem', fontWeight: 600, color: '#1565C0', cursor: 'pointer'
                                }}
                              >
                                {suf}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option: Card */}
                  <div
                    className={`payment-option ${paymentMethod === 'razorpay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('razorpay')}
                    style={{ cursor: 'pointer', padding: 18, borderRadius: 16 }}
                  >
                    <input type="radio" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                    <span style={{ fontSize: '1.6rem' }}>💳</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                        Credit or Debit Card (Visa, Mastercard, RuPay)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Secured with 3D Secure OTP authentication
                      </div>
                    </div>
                  </div>

                  {/* Sub-form: Card */}
                  {paymentMethod === 'razorpay' && (
                    <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 20, border: '1px solid #E2E8F8', marginLeft: 28 }}>
                      <div className="form-group" style={{ marginBottom: 14 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Card Number</label>
                        <input
                          type="text"
                          className="form-input"
                          value={cardForm.number}
                          onChange={(e) => setCardForm((f) => ({ ...f, number: e.target.value }))}
                          style={{ fontSize: '0.9rem', letterSpacing: 1 }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem' }}>Name on Card</label>
                          <input
                            type="text"
                            className="form-input"
                            value={cardForm.name}
                            onChange={(e) => setCardForm((f) => ({ ...f, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem' }}>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={cardForm.expiry}
                            onChange={(e) => setCardForm((f) => ({ ...f, expiry: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem' }}>CVV</label>
                          <input
                            type="password"
                            className="form-input"
                            maxLength={4}
                            value={cardForm.cvv}
                            onChange={(e) => setCardForm((f) => ({ ...f, cvv: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option: COD */}
                  <div
                    className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                    style={{ cursor: 'pointer', padding: 18, borderRadius: 16 }}
                  >
                    <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <span style={{ fontSize: '1.6rem' }}>💵</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                        Cash on Delivery (COD)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Pay cash or UPI upon package handover at your doorstep
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowLeft size={16} /> Back to Address
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={() => setStep(3)}
                    id="continue-to-review-btn"
                  >
                    Review Order Summary <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ─── STEP 3: REVIEW & PLACE ─── */}
            {step === 3 && (
              <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid #E2E8F8', boxShadow: '0 2px 14px rgba(27,31,59,0.03)' }}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.35rem', marginBottom: 20 }}>
                  3. Review Order & Place
                </h2>

                {/* Items Breakdown */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', marginBottom: 12 }}>
                    Items in Shipment ({items.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}-${item.color}`}
                        style={{ display: 'flex', gap: 14, padding: '12px 16px', background: '#F8FAFC', borderRadius: 14, border: '1px solid #F1F5F9' }}
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                            {item.product.name}
                          </div>
                          <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: 2 }}>
                            Size: <strong style={{ color: '#0F172A' }}>{item.size}</strong> · Color: {item.color} · Qty: {item.quantity}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#1565C0', fontSize: '1rem' }}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Payment verification */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                  <div style={{ background: '#F8FAFC', borderRadius: 14, padding: 16, border: '1px solid #E2E8F8' }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', color: '#1565C0', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} /> Delivering To
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
                      <strong>{currentAddress?.name}</strong><br />
                      {currentAddress?.line1}, {currentAddress?.city}<br />
                      {currentAddress?.state} — {currentAddress?.pincode}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: 14, padding: 16, border: '1px solid #E2E8F8' }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', color: '#1565C0', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CreditCard size={14} /> Payment Choice
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
                      Mode: <strong style={{ textTransform: 'uppercase' }}>{paymentMethod}</strong><br />
                      {paymentMethod === 'upi' ? `VPA: ${upiId}` : paymentMethod === 'cod' ? 'Pay upon delivery' : 'Prepaid via Card'}
                    </div>
                  </div>
                </div>

                {/* Place Order CTA */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    className="btn btn-secondary btn-lg"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '1.05rem', fontWeight: 800 }}
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    id="place-order-submit-btn"
                  >
                    {loading ? (
                      <span>⏳ Processing Order...</span>
                    ) : (
                      <>⚡ Confirm & Pay ₹{total.toLocaleString('en-IN')}</>
                    )}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, color: '#64748B', fontSize: '0.775rem' }}>
                  <Shield size={14} color="#16A34A" /> 100% Purchase Protection · 7-Day Easy Returns
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Card */}
          <div style={{ position: 'sticky', top: 88 }}>
            <div style={{ background: 'white', borderRadius: 24, padding: 26, border: '1px solid #E2E8F8', boxShadow: '0 2px 14px rgba(27,31,59,0.03)' }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem', marginBottom: 18 }}>Order Summary</h3>

              {/* Items List preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: '#475569' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                      {item.product.name} ({item.size}) × {item.quantity}
                    </span>
                    <strong style={{ color: '#0F172A' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div style={{ borderTop: '1px solid #E2E8F8', paddingTop: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag size={14} color="#1565C0" /> Promo & Admin Coupons
                  </span>
                  {couponCode && (
                    <button
                      type="button"
                      onClick={() => {
                        removeCoupon();
                        setCheckoutCouponSuccess('');
                        setCheckoutCouponError('');
                      }}
                      style={{ fontSize: '0.75rem', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {couponCode ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: '#ECFDF5',
                    border: '1px dashed #059669',
                    color: '#065F46',
                    fontSize: '0.825rem',
                    fontWeight: 600
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={14} color="#059669" /> Coupon <strong>{couponCode}</strong> applied!
                    </span>
                    <span style={{ color: '#059669', fontWeight: 800 }}>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      placeholder="Enter code (e.g. SPORT20)"
                      value={checkoutCouponInput}
                      onChange={(e) => {
                        setCheckoutCouponInput(e.target.value.toUpperCase());
                        setCheckoutCouponError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCheckoutCoupon();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: checkoutCouponError ? '1px solid #EF4444' : '1px solid #CBD5E1',
                        fontSize: '0.825rem',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        outline: 'none',
                        letterSpacing: '0.5px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCheckoutCoupon()}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 10,
                        background: '#0F172A',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Apply
                    </button>
                  </div>
                )}

                {checkoutCouponError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#DC2626', fontSize: '0.75rem', marginTop: 6, fontWeight: 500 }}>
                    <AlertCircle size={13} /> {checkoutCouponError}
                  </div>
                )}
                {checkoutCouponSuccess && !couponCode && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16A34A', fontSize: '0.75rem', marginTop: 6, fontWeight: 500 }}>
                    <Check size={13} /> {checkoutCouponSuccess}
                  </div>
                )}

                {/* Available Admin Coupons Pills */}
                {availableCoupons.filter((c) => c.active).length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, marginBottom: 6 }}>
                      Admin Coupons (click to apply):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {availableCoupons
                        .filter((c) => c.active)
                        .map((c) => {
                          const isApplied = couponCode === c.code;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleApplyCheckoutCoupon(c.code)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: isApplied ? '1px solid #16A34A' : '1px dashed #94A3B8',
                                background: isApplied ? '#F0FDF4' : '#F8FAFC',
                                color: isApplied ? '#16A34A' : '#334155',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                              title={c.type === 'percentage' ? `${c.value}% OFF (min ₹${c.minOrder})` : `₹${c.value} OFF (min ₹${c.minOrder})`}
                            >
                              <span>{c.code}</span>
                              <span style={{ color: '#0284C7', fontWeight: 600, fontSize: '0.68rem' }}>
                                ({c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`})
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #E2E8F8', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748B' }}>Bag Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748B' }}>Delivery Courier</span>
                  <span style={{ fontWeight: 700, color: shipping === 0 ? '#16A34A' : '#0F172A' }}>
                    {shipping === 0 ? 'FREE 🎉' : `₹${shipping}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748B' }}>Standard GST (5%)</span>
                  <span style={{ fontWeight: 600 }}>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#16A34A', fontWeight: 700 }}>
                    <span>Coupon ({couponCode})</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div style={{ borderTop: '1.5px solid #E2E8F8', marginTop: 14, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Total Payable</span>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.4rem', color: '#1565C0' }}>
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL: INLINE ADD ADDRESS ─── */}
      {isAddAddressOpen && (
        <div className="modal-overlay" onClick={() => setIsAddAddressOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>New Delivery Address</h3>
              <button onClick={() => setIsAddAddressOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddNewAddress}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddr.name}
                      onChange={(e) => setNewAddr((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr((f) => ({ ...f, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Flat / House No. / Building *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newAddr.line1}
                    onChange={(e) => setNewAddr((f) => ({ ...f, line1: e.target.value }))}
                    placeholder="e.g. Flat 301, Marvel Residency"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark / Street (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newAddr.line2}
                    onChange={(e) => setNewAddr((f) => ({ ...f, line2: e.target.value }))}
                    placeholder="e.g. Opposite City Sports Club"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr((f) => ({ ...f, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr((f) => ({ ...f, state: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr((f) => ({ ...f, pincode: e.target.value }))}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddAddressOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-checkout-address-btn">Save & Deliver Here</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
