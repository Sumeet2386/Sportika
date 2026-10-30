import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck, RefreshCw, Shield, FileText, Mail, Phone,
  MapPin, HelpCircle, ChevronDown, ChevronUp, Check, Send
} from 'lucide-react';
import { useUIStore } from '../store';

// ── 1. SHIPPING POLICY ──
export function ShippingPolicyPage() {
  return (
    <div style={{ background: '#F8FAFF', minHeight: '85vh', paddingBottom: 64 }}>
      <div style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: 'white', padding: '48px 0 36px' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Truck size={32} />
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.2rem' }}>Shipping & Delivery Policy</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '1rem' }}>
            Fast, secure, and reliable pan-India delivery for all Sportika athletes.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 900, paddingTop: 40 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 40, border: '1px solid #E2E8F8', boxShadow: '0 2px 14px rgba(27,31,59,0.03)' }}>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: '#0F172A', marginBottom: 12 }}>
              1. Delivery Timelines
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.8 }}>
              All orders are processed and dispatched within <strong>24 to 48 hours</strong> from our central logistics hub in Pune, Maharashtra. Delivery typically takes:
            </p>
            <ul style={{ color: '#475569', lineHeight: 1.8, paddingLeft: 24, marginTop: 8 }}>
              <li><strong>Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata):</strong> 2 to 4 business days.</li>
              <li><strong>Tier 2 & Tier 3 Cities:</strong> 3 to 6 business days.</li>
              <li><strong>North-East & Remote Locations:</strong> 5 to 7 business days.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: '#0F172A', marginBottom: 12 }}>
              2. Shipping Charges
            </h2>
            <div style={{ background: '#F8FAFC', borderRadius: 14, padding: 20, border: '1px solid #E2E8F8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #E2E8F8', marginBottom: 10 }}>
                <span>Orders <strong>₹999 and above</strong>:</span>
                <strong style={{ color: '#16A34A' }}>FREE SHIPPING 🎉</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Orders <strong>below ₹999</strong>:</span>
                <strong>Flat ₹99 standard courier fee</strong>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: '#0F172A', marginBottom: 12 }}>
              3. Courier Partners & Tracking
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.8 }}>
              We partner with India's premier logistics providers including <strong>BlueDart, Delhivery, Shadowfax, and Xpressbees</strong>. As soon as your order is dispatched, you will receive an SMS and email containing your live tracking Air Waybill (AWB) number. You can also track your order in real-time in the <Link to="/orders" style={{ color: '#1565C0', fontWeight: 700 }}>My Orders</Link> portal.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: '#0F172A', marginBottom: 12 }}>
              4. Damaged or Tampered Shipments
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.8 }}>
              If you receive a package that looks damaged or opened, please do not accept the package or take an unboxing video and immediately reach out to our team at <a href="mailto:support@sportika.in" style={{ color: '#1565C0', fontWeight: 700 }}>support@sportika.in</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── 2. RETURN & REFUND POLICY ──
export function ReturnPolicyPage() {
  return (
    <div style={{ background: '#F8FAFF', minHeight: '85vh', paddingBottom: 64 }}>
      <div style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: 'white', padding: '48px 0 36px' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <RefreshCw size={32} />
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.2rem' }}>7-Day Returns & Exchange Policy</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '1rem' }}>
            Hassle-free size exchanges and full refunds because your perfect fit matters.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 900, paddingTop: 40 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 40, border: '1px solid #E2E8F8', boxShadow: '0 2px 14px rgba(27,31,59,0.03)' }}>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: '#0F172A', marginBottom: 12 }}>
              1. 7-Day Return Window
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.8 }}>
              At Sportika, we want you to feel 100% confident in your athletic gear. If you are not completely satisfied with your purchase or require a different size, you may request an exchange or return within <strong>7 days of delivery</strong>.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: '#0F172A', marginBottom: 12 }}>
              2. Eligibility Criteria
            </h2>
            <ul style={{ color: '#475569', lineHeight: 1.8, paddingLeft: 24 }}>
              <li>Apparel must be unused, unwashed, and in its original condition.</li>
              <li>All original brand tags, barcodes, and packaging must be intact.</li>
              <li>Innerwear, socks, and personal protective accessories are non-returnable for hygiene reasons.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: '#0F172A', marginBottom: 12 }}>
              3. Reverse Pickup & Refund Process
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.8 }}>
              Once your return request is submitted in the <Link to="/orders" style={{ color: '#1565C0', fontWeight: 700 }}>Orders Page</Link>, our courier partner will pick up the package from your doorstep within <strong>48 hours</strong>.
            </p>
            <p style={{ color: '#475569', lineHeight: 1.8, marginTop: 8 }}>
              After our quality team inspects the returned item, your refund will be processed:
            </p>
            <ul style={{ color: '#475569', lineHeight: 1.8, paddingLeft: 24, marginTop: 8 }}>
              <li><strong>Prepaid Orders (Cards/UPI):</strong> Refunded directly to your original source account within <strong>3-5 business days</strong>.</li>
              <li><strong>Cash on Delivery (COD):</strong> Refunded to your provided UPI ID or bank account details.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── 3. PRIVACY POLICY ──
export function PrivacyPolicyPage() {
  return (
    <div style={{ background: '#F8FAFF', minHeight: '85vh', paddingBottom: 64 }}>
      <div style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: 'white', padding: '48px 0 36px' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Shield size={32} />
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.2rem' }}>Privacy Policy</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '1rem' }}>
            We respect your privacy and are committed to protecting your personal data under the DPDP Act.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 900, paddingTop: 40 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 40, border: '1px solid #E2E8F8', color: '#475569', lineHeight: 1.8 }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>1. Information We Collect</h2>
          <p style={{ marginBottom: 24 }}>
            When you visit Sportika, create an account, or purchase athletic wear, we collect your name, email address, phone number, shipping address, and order transaction records. We do not store your raw credit/debit card numbers or UPI PINs; all payments are processed through RBI-approved gateways.
          </p>

          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>2. How We Use Your Data</h2>
          <p style={{ marginBottom: 24 }}>
            Your information is strictly used to fulfill your sportswear orders, send delivery tracking updates, process returns, and (with your consent) provide member deals and new arrival alerts.
          </p>

          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>3. Data Protection & Security</h2>
          <p style={{ marginBottom: 24 }}>
            We implement 256-bit SSL encryption across all browsing and checkout sessions. We never sell, rent, or trade your personal information with third-party advertising brokers.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 4. TERMS OF SERVICE ──
export function TermsPage() {
  return (
    <div style={{ background: '#F8FAFF', minHeight: '85vh', paddingBottom: 64 }}>
      <div style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: 'white', padding: '48px 0 36px' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <FileText size={32} />
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.2rem' }}>Terms of Service</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '1rem' }}>
            Standard commercial agreement governing the use of Sportika Global Sportswear.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 900, paddingTop: 40 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 40, border: '1px solid #E2E8F8', color: '#475569', lineHeight: 1.8 }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>1. Agreement to Terms</h2>
          <p style={{ marginBottom: 24 }}>
            By accessing or purchasing from the Sportika website, you agree to be bound by these Terms of Service and all applicable Indian consumer laws.
          </p>

          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>2. Pricing & Product Accuracy</h2>
          <p style={{ marginBottom: 24 }}>
            All prices are quoted in Indian Rupees (INR) and are inclusive of applicable GST taxes. We strive for complete accuracy in product representations, fabric specifications, and colors.
          </p>

          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>3. Intellectual Property</h2>
          <p style={{ marginBottom: 24 }}>
            The Sportika name, logo, proprietary apparel designs, and website content are protected by trademark and copyright laws.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 5. CONTACT US ──
export function ContactPage() {
  const { addNotification } = useUIStore();
  const [sent, setSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: 'Order Inquiry', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    addNotification('success', 'Your inquiry has been received! We will reply within 4 hours.');
  };

  return (
    <div style={{ background: '#F8FAFF', minHeight: '85vh', paddingBottom: 64 }}>
      <div style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: 'white', padding: '48px 0 36px' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.2rem', marginBottom: 8 }}>Get in Touch with Sportika</h1>
          <p style={{ opacity: 0.85, fontSize: '1rem' }}>We're here to help athletes, coaches, and sports lovers perform at their best.</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1000, paddingTop: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 32 }}>
          {/* Contact Details */}
          <div>
            <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid #E2E8F8', marginBottom: 24, boxShadow: '0 2px 14px rgba(27,31,59,0.03)' }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', marginBottom: 20 }}>Support Channels</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1565C0', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>Customer Support</div>
                    <div style={{ color: '#64748B', fontSize: '0.85rem' }}>support@sportika.in</div>
                    <div style={{ color: '#16A34A', fontSize: '0.75rem', fontWeight: 600 }}>Avg. response: &lt; 2 hours</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1565C0', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>Toll-Free Helpline</div>
                    <div style={{ color: '#64748B', fontSize: '0.85rem' }}>+91 1800-SPORTIKA (1800-776-784)</div>
                    <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Mon - Sat: 9:00 AM - 8:00 PM IST</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1565C0', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>Central Logistics & HQ</div>
                    <div style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      Plot 42, Sportika Logistics Park<br />
                      Shivajinagar, Pune, Maharashtra 411005
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div style={{ background: 'white', borderRadius: 24, padding: 36, border: '1px solid #E2E8F8', boxShadow: '0 2px 14px rgba(27,31,59,0.03)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: 64, height: 64, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', margin: '0 auto 16px' }}>
                  <Check size={32} />
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ color: '#64748B', marginBottom: 20 }}>Our customer support team is reviewing your message and will reach out shortly.</p>
                <button className="btn btn-outline btn-sm" onClick={() => setSent(false)}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', marginBottom: 4 }}>Send Us a Message</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={contactForm.name}
                      onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={contactForm.email}
                      onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select
                      className="form-input"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm((f) => ({ ...f, subject: e.target.value }))}
                    >
                      <option value="Order Inquiry">Order & Delivery Status</option>
                      <option value="Size Exchange">Size Exchange or Return</option>
                      <option value="Bulk Order">Bulk / Team Uniforms</option>
                      <option value="Feedback">Feedback / Suggestions</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Message *</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us how we can assist you..."
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Send size={16} /> Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 6. FAQ PAGE ──
export function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I track my order once placed?',
      a: 'As soon as your order is confirmed, you will receive a tracking link via SMS. You can also visit our My Orders portal at any time to view a live vertical progress timeline with courier updates.',
    },
    {
      q: 'What is your size exchange policy?',
      a: 'We offer free, 7-day hassle-free size exchanges. If your athletic apparel is slightly tight or loose, go to your Orders page, click on Return / Exchange, and our team will arrange a doorstep replacement.',
    },
    {
      q: 'What payment modes are accepted on Sportika?',
      a: 'We support all major payment methods including Google Pay, PhonePe, Paytm, BHIM UPI, Visa, Mastercard, RuPay cards, and Cash on Delivery (COD).',
    },
    {
      q: 'Are your fabrics sweat-wicking and suitable for high-intensity training?',
      a: 'Yes! Every Sportika product is engineered with active microfiber technology featuring 4-way stretch, anti-odor silver ion coating, and rapid moisture-wicking properties tested by professional athletes.',
    },
    {
      q: 'How do I apply a discount coupon code?',
      a: 'You can apply promo coupons such as SPORT20, WELCOME10, or FLAT500 directly in your Cart Drawer, the Cart Page, or during Step 3 of Checkout.',
    },
  ];

  return (
    <div style={{ background: '#F8FAFF', minHeight: '85vh', paddingBottom: 64 }}>
      <div style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: 'white', padding: '48px 0 36px' }}>
        <div className="container" style={{ maxWidth: 840 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <HelpCircle size={32} />
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.2rem' }}>Frequently Asked Questions</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '1rem' }}>
            Find quick answers to common questions about orders, payments, sizing, and delivery.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 840, paddingTop: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'white', borderRadius: 18, border: `1.5px solid ${isOpen ? '#1565C0' : '#E2E8F8'}`,
                  overflow: 'hidden', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.05rem', color: isOpen ? '#1565C0' : '#0F172A' }}>
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={20} color="#1565C0" /> : <ChevronDown size={20} color="#64748B" />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 24px 22px', color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
