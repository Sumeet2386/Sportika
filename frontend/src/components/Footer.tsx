import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin, Shield, Truck, RefreshCw, Headphones } from 'lucide-react';
import SportikaLogo from './SportikaLogo';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Trust Badges */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 48, marginBottom: 48 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
            {[
              { icon: <Truck size={26} />, title: 'Free Shipping', desc: 'On all orders', color: '#22C55E' },
              { icon: <RefreshCw size={26} />, title: 'Easy Returns', desc: '7-day return policy', color: '#FF6B35' },
              { icon: <Shield size={26} />, title: 'Secure Payment', desc: '100% secure checkout', color: '#3D52D5' },
              { icon: <Headphones size={26} />, title: '24/7 Support', desc: 'Dedicated support team', color: '#8B5CF6' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color,
                }}>
                  {item.icon}
                </div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.4)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-logo-section">
            <div style={{ marginBottom: 16 }}>
              <SportikaLogo size={48} showText={true} textColor="rgba(255,255,255,0.5)" />
            </div>
            <p className="footer-desc">
              Premium sportswear engineered for champions. From the track to the gym, Sportika equips you to perform at your best.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)' }}>
                <Mail size={13} /> <span>support@sportika.in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)' }}>
                <Phone size={13} /> <span>+91 1800-SPORTIKA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)' }}>
                <MapPin size={13} /> <span>Pune, Maharashtra, India</span>
              </div>
            </div>
            <div className="social-links">
              {[
                { icon: <Instagram size={16} />, href: '#', label: 'Instagram' },
                { icon: <Facebook size={16} />, href: '#', label: 'Facebook' },
                { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
                { icon: <Youtube size={16} />, href: '#', label: 'YouTube' },
              ].map(s => (
                <a key={s.label} href={s.href} className="social-link" aria-label={s.label}>{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Men's */}
          <div>
            <div className="footer-heading">Men's</div>
            <div className="footer-links">
              {[
                { label: 'T-Shirts', to: '/products?category=men&sub=tshirts' },
                { label: 'Shorts', to: '/products?category=men&sub=shorts' },
                { label: 'Jackets', to: '/products?category=men&sub=jackets' },
                { label: 'Track Pants', to: '/products?category=men&sub=track-pants' },
                { label: 'Shoes', to: '/products?category=men&sub=shoes' },
                { label: 'Accessories', to: '/products?category=men&sub=accessories' },
              ].map(item => (
                <Link key={item.to} to={item.to} className="footer-link">{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Women's */}
          <div>
            <div className="footer-heading">Women's</div>
            <div className="footer-links">
              {[
                { label: 'Tops & T-Shirts', to: '/products?category=women&sub=tshirts' },
                { label: 'Shorts', to: '/products?category=women&sub=shorts' },
                { label: 'Jackets', to: '/products?category=women&sub=jackets' },
                { label: 'Leggings', to: '/products?category=women&sub=track-pants' },
                { label: 'Shoes', to: '/products?category=women&sub=shoes' },
                { label: 'Sports Bras', to: '/products?category=women' },
              ].map(item => (
                <Link key={item.to} to={item.to} className="footer-link">{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Help */}
          <div>
            <div className="footer-heading">Help & Info</div>
            <div className="footer-links">
              {[
                { label: 'Size Guide', to: '/size-guide' },
                { label: 'Track Order', to: '/orders' },
                { label: 'Return & Refund', to: '/returns' },
                { label: 'Shipping Policy', to: '/shipping' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'FAQ', to: '/faq' },
              ].map(item => (
                <Link key={item.to} to={item.to} className="footer-link">{item.label}</Link>
              ))}
            </div>
          </div>
        </div>



        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span>© 2024 Sportika Global Sportswear. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>🔒 Secured by</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Razorpay · UPI · Visa · Mastercard · Rupay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
