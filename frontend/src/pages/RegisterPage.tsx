import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, AlertCircle,
  Database, ShieldCheck, ArrowRight, RefreshCw, X, Sparkles
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store';
import { authAPI, checkAPIHealth } from '../api';
import { GoogleAuthButton } from '../components/GoogleAuthModal';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Email Verification State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [resending, setResending] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [pendingToken, setPendingToken] = useState<string>('');

  const { login } = useAuthStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAPIHealth().then(setApiOnline);
  }, []);

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone ? form.phone.trim() : undefined,
      }) as any;

      if (result.success) {
        if (result.data?.user && result.data?.token) {
          login(result.data.user, result.data.token);
        }
        setPendingUser(result.data?.user || null);
        setPendingToken(result.data?.token || '');
        setVerifyOtpInput('');
        setIsVerificationModalOpen(true);
        addNotification('success', `Welcome to Sportika, ${form.name.split(' ')[0]}! Account created successfully. 🎉`);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = verifyOtpInput.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setVerifyError('Please enter the 6-digit verification code.');
      return;
    }

    setVerifying(true);
    setVerifyError('');
    try {
      const res = await authAPI.verifyOtp(form.email.trim().toLowerCase(), cleanCode) as any;
      if (res.success) {
        const finalUser = res.data?.user || pendingUser;
        const finalToken = res.data?.token || pendingToken;
        if (finalUser && finalToken) {
          login(finalUser, finalToken);
        }
        addNotification('success', `Email verified! Welcome to Sportika, ${form.name.split(' ')[0]}! 🎉`);
        setIsVerificationModalOpen(false);
        navigate('/');
      } else {
        setVerifyError(res.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setVerifyError('');
    try {
      const res = await authAPI.sendOtp(form.email.trim().toLowerCase()) as any;
      if (res.success) {
        addNotification('success', 'A new verification code has been sent!');
      } else {
        setVerifyError(res.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      setVerifyError('Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  const strength = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password)
    ? 'strong' : form.password.length >= 6 ? 'medium' : 'weak';
  const strengthColor = strength === 'strong' ? '#2ECC71' : strength === 'medium' ? '#F59E0B' : '#E74C3C';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0D14 0%, #10192A 40%, #162038 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '20%', right: '15%', width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, rgba(255, 107, 53, 0) 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(320px, 400px) minmax(360px, 480px)', maxWidth: 920, width: '100%',
        background: 'white', borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 30px 90px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1,
      }}>
        {/* ── Left Panel ── */}
        <div style={{
          background: 'linear-gradient(160deg, #101828 0%, #0F203C 50%, #1B294B 100%)',
          padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'white',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 44 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', fontStyle: 'italic', letterSpacing: '0.04em', color: 'white' }}>
                SPORTI<span style={{ color: '#FF6B35' }}>KA</span>
              </span>
            </Link>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', marginBottom: 16, lineHeight: 1.2 }}>
            Join the Sportika Family!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 32, fontSize: '0.9rem' }}>
            Create your free account and get 20% off on your first order. Your data is stored securely.
          </p>
          {[
            '🎁 20% off your first order',
            '🏆 Exclusive member rewards',
            '📦 Free returns & exchanges',
            '⚡ Early access to new drops',
            '🔒 Secure, private account with email verification',
          ].map((item) => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
              fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)'
            }}>
              <CheckCircle size={14} style={{ flexShrink: 0 }} /> {item}
            </div>
          ))}
          </div>

          {/* Database status */}
          {apiOnline !== null && (
            <div style={{
              marginTop: 24, padding: '10px 14px', borderRadius: 10,
              background: apiOnline ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${apiOnline ? 'rgba(46,204,113,0.3)' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem',
              color: apiOnline ? '#2ECC71' : 'rgba(255,255,255,0.7)'
            }}>
              <Database size={12} />
              {apiOnline
                ? '✅ Database active — your account will be saved'
                : '⚠️ Offline mode — connect backend to save data'}
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div style={{ padding: '40px 48px', overflowY: 'auto', maxHeight: '90vh' }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', marginBottom: 6 }}>Create Account</h3>
          <p style={{ color: '#8896B3', fontSize: '0.875rem', marginBottom: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1565C0', fontWeight: 600 }}>Sign in</Link>
          </p>

          {/* Google Sign Up Button */}
          <div style={{ marginBottom: 18 }}>
            <GoogleAuthButton
              label="Sign up directly with Google"
              redirectTo="/"
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '16px 0 8px',
              gap: 12,
              color: '#94A3B8',
              fontSize: '0.78rem',
              fontWeight: 500,
            }}>
              <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              <span>or register with email</span>
              <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            </div>
          </div>

          {error && (
            <div style={{
              background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 12,
              padding: '12px 16px', marginBottom: 18, color: '#E74C3C', fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
              {error.toLowerCase().includes('already exists') && (
                <Link
                  to="/login"
                  state={{ prefillEmail: form.email }}
                  style={{
                    background: '#E74C3C',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Sign In →
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8896B3' }} />
                <input
                  type="text" className="form-input" placeholder="John Doe"
                  value={form.name} onChange={setField('name')}
                  style={{ paddingLeft: 42 }} id="reg-name"
                  autoComplete="name" required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8896B3' }} />
                <input
                  type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={setField('email')}
                  style={{ paddingLeft: 42 }} id="reg-email"
                  autoComplete="email" required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number <span style={{ color: '#8896B3', fontWeight: 400 }}>(optional)</span></label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8896B3' }} />
                <input
                  type="tel" className="form-input" placeholder="+91 98765 43210"
                  value={form.phone} onChange={setField('phone')}
                  style={{ paddingLeft: 42 }} id="reg-phone"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8896B3' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input" placeholder="Min. 6 characters"
                  value={form.password} onChange={setField('password')}
                  style={{ paddingLeft: 42, paddingRight: 42 }} id="reg-password"
                  autoComplete="new-password" required
                />
                <button
                  type="button" onClick={() => setShowPass((v) => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#8896B3', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {['weak', 'medium', 'strong'].map((s, i) => (
                      <div key={s} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= ['weak', 'medium', 'strong'].indexOf(strength) ? strengthColor : '#E2E8F8',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: strengthColor, fontWeight: 600, textTransform: 'capitalize' }}>
                    {strength} password
                    {strength === 'weak' && ' — add uppercase & numbers for stronger security'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8896B3' }} />
                <input
                  type="password" className="form-input" placeholder="Confirm your password"
                  value={form.confirmPassword} onChange={setField('confirmPassword')}
                  style={{ paddingLeft: 42 }} id="reg-confirm-password"
                  autoComplete="new-password" required
                />
                {form.confirmPassword && (
                  <CheckCircle
                    size={16}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      color: form.password === form.confirmPassword ? '#2ECC71' : '#E74C3C',
                      transition: 'color 0.2s'
                    }}
                  />
                )}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#8896B3', lineHeight: 1.5 }}>
              By creating an account, you agree to our{' '}
              <Link to="/terms" style={{ color: '#1565C0' }}>Terms of Service</Link> and{' '}
              <Link to="/privacy" style={{ color: '#1565C0' }}>Privacy Policy</Link>.
            </div>

            <button
              type="submit" className="btn btn-primary btn-lg"
              disabled={loading} id="register-submit" style={{ marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Setting up account...
                </span>
              ) : 'Create Account 🚀'}
            </button>
          </form>
        </div>
      </div>

      {/* ─── EMAIL VERIFICATION OTP MODAL ─── */}
      {isVerificationModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 460,
              boxShadow: '0 25px 70px rgba(0,0,0,0.35)',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.25s ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0D47A1, #1565C0)',
                padding: '28px 28px 24px',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsVerificationModalOpen(false);
                  navigate('/');
                }}
                style={{
                  position: 'absolute',
                  right: 18,
                  top: 18,
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>

              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                }}
              >
                <Mail size={28} color="#FFD700" />
              </div>

              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>
                Verify Your Email
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: 6 }}>
                We've sent a 6-digit verification code to
              </p>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.25)',
                  padding: '4px 14px',
                  borderRadius: 20,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginTop: 6,
                  letterSpacing: '0.3px',
                }}
              >
                {form.email}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '26px 28px 28px' }}>
              {verifyError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: 10,
                    padding: '10px 14px',
                    marginBottom: 16,
                    color: '#DC2626',
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{verifyError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                    Enter 6-Digit OTP Code:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={verifyOtpInput}
                    onChange={(e) => {
                      setVerifyOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setVerifyError('');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: verifyError ? '2px solid #EF4444' : '2px solid #CBD5E1',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '10px',
                      fontFamily: 'monospace',
                      outline: 'none',
                      color: '#0F172A',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
                    }}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying || verifyOtpInput.length < 6}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    background: verifyOtpInput.length === 6 ? '#1565C0' : '#94A3B8',
                    color: 'white',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: verifyOtpInput.length === 6 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(21,101,192,0.25)',
                  }}
                >
                  {verifying ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Verifying...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Verify & Activate Account
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsVerificationModalOpen(false);
                    navigate('/');
                  }}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: 12,
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: 10,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E2E8F0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                  }}
                >
                  Skip for now & Start Shopping →
                </button>
              </form>

              {/* Resend Link */}
              <div
                style={{
                  marginTop: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  color: '#64748B',
                }}
              >
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1565C0',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: 0,
                  }}
                >
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
