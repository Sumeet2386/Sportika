import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Zap, AlertCircle } from 'lucide-react';
import { useAuthStore, useUIStore } from '../store';
import { authAPI, checkAPIHealth } from '../api';
import { GoogleAuthButton } from '../components/GoogleAuthModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  const { login } = useAuthStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';
  const adminNeeded = (location.state as any)?.adminNeeded;

  // Check if backend API is available
  useEffect(() => {
    checkAPIHealth().then(setApiOnline);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);

    try {
      const result = await authAPI.login({ email, password }) as any;
      if (result.success && result.data) {
        const { user, token } = result.data;
        login(user, token);
        addNotification('success', `Welcome back, ${user.name.split(' ')[0]}! 👋`);
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from === '/admin' ? '/' : from);
        }
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D1117 0%, #0D47A1 50%, #FF6F00 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 900, width: '100%',
        background: 'white', borderRadius: 28, overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0,0,0,0.4)'
      }}>
        {/* ── Left Panel ── */}
        <div style={{
          background: 'linear-gradient(160deg, #0D47A1, #1565C0 60%, #0D1117)',
          padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white'
        }}>
          <Link to="/" style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.5rem', color: 'white', marginBottom: 48 }}>
            SPORTI<span style={{ color: '#FFD700' }}>KA</span>
          </Link>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', marginBottom: 16, lineHeight: 1.2 }}>
            {adminNeeded ? '🛡️ Admin Access Required' : 'Welcome Back, Champion!'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 32, fontSize: '0.9rem' }}>
            {adminNeeded
              ? 'Sign in with your admin credentials to access the dashboard.'
              : 'Sign in to access your orders, wishlist, and exclusive member deals.'}
          </p>
          {[
            '🚀 Exclusive member discounts',
            '📦 Track all your orders',
            '❤️ Save items to wishlist',
            '⚡ Faster checkout experience',
          ].map((item) => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)'
            }}>
              {item}
            </div>
          ))}

          {/* API Status */}
          {apiOnline !== null && (
            <div style={{
              marginTop: 32, padding: '10px 14px', borderRadius: 10,
              background: apiOnline ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
              border: `1px solid ${apiOnline ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`,
              display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem',
              color: apiOnline ? '#2ECC71' : '#E74C3C'
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: apiOnline ? '#2ECC71' : '#E74C3C',
                animation: apiOnline ? 'pulse 2s infinite' : 'none'
              }} />
              {apiOnline ? 'Database connected — accounts are saved' : 'Running in demo mode (offline)'}
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div style={{ padding: 48 }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', marginBottom: 8 }}>Sign In</h3>
          <p style={{ color: '#8896B3', fontSize: '0.875rem', marginBottom: 24 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1565C0', fontWeight: 600 }}>Create one free</Link>
          </p>

          {/* Google Sign In Option */}
          <div style={{ marginBottom: 20 }}>
            <GoogleAuthButton
              label="Sign in directly with Google"
              redirectTo={from === '/admin' ? '/' : from}
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '18px 0 10px',
              gap: 12,
              color: '#94A3B8',
              fontSize: '0.78rem',
              fontWeight: 500,
            }}>
              <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              <span>or sign in with email</span>
              <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            </div>
          </div>

          {error && (
            <div style={{
              background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 10,
              padding: '12px 16px', marginBottom: 20, color: '#E74C3C', fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8896B3' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 42 }}
                  id="login-email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
                <span style={{ fontSize: '0.8rem', color: '#8896B3' }}>Min. 6 characters</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8896B3' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  id="login-password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#8896B3', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              id="login-submit"
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Signing In...
                </span>
              ) : (
                <><ArrowRight size={18} /> Sign In</>
              )}
            </button>
          </form>

          {/* Info box */}
          <div style={{ marginTop: 24, padding: '14px 16px', background: '#F8FAFF', borderRadius: 14, border: '1px solid #E2E8F8' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3D4A6B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={13} />
              Getting Started
            </div>
            <div style={{ fontSize: '0.76rem', color: '#8896B3', lineHeight: 1.6 }}>
              <strong style={{ color: '#3D4A6B' }}>New customer?</strong> Create a free account via the link above to start shopping.<br />
              <strong style={{ color: '#3D4A6B' }}>Admin access?</strong> Use your admin credentials set up in the system.
            </div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}
                onClick={() => { setEmail(''); setPassword(''); navigate('/register'); }}
                id="go-register"
              >
                👤 Create Account
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#FF6F00' }}
                onClick={() => { setEmail('admin@sportika.in'); setPassword(''); }}
                id="fill-admin-email"
              >
                <Zap size={13} /> Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
