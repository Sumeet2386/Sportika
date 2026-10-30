import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Zap, AlertCircle,
  CheckCircle, RefreshCw, KeyRound, Sparkles, ChevronLeft, ShieldCheck
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store';
import { authAPI, checkAPIHealth } from '../api';
import { GoogleAuthButton } from '../components/GoogleAuthModal';

type AuthMode = 'password' | 'otp_login' | 'forgot_password';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // OTP / Forgot Password states
  const [otpStep, setOtpStep] = useState<1 | 2>(1); // 1 = enter email, 2 = enter otp (+ new password)
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [previewOtp, setPreviewOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { login } = useAuthStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';
  const adminNeeded = (location.state as any)?.adminNeeded;

  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Start resend countdown
  const startTimer = (seconds = 30) => {
    setCountdown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    checkAPIHealth().then(setApiOnline);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Reset errors when switching modes
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setOtpStep(1);
    setOtpCode('');
    setPreviewOtp('');
    setNewPassword('');
  };

  // 1. Handle Standard Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);

    try {
      const result = (await authAPI.login({
        email: email.trim().toLowerCase(),
        password,
      })) as any;

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
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle OTP Login - Send OTP
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);

    try {
      const res = (await authAPI.sendOtp(email.trim().toLowerCase())) as any;
      if (res.success) {
        setOtpStep(2);
        setPreviewOtp(res.code || '');
        setOtpCode(res.code || ''); // Pre-fill for instant seamless testing
        setSuccessMsg(`Verification code sent to ${email}`);
        startTimer(30);
      } else {
        setError(res.message || 'Could not send verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 2b. Handle OTP Login - Verify OTP & Log In
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);

    try {
      const res = (await authAPI.verifyOtp(email.trim().toLowerCase(), otpCode.trim())) as any;
      if (res.success && res.data) {
        const { user, token } = res.data;
        login(user, token);
        addNotification('success', `Email verified! Signed in as ${user.name}! 🚀`);
        navigate(from === '/admin' ? '/' : from);
      } else {
        setError(res.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Forgot Password - Request Reset Code
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);

    try {
      const res = (await authAPI.forgotPassword(email.trim().toLowerCase())) as any;
      if (res.success) {
        setOtpStep(2);
        setPreviewOtp(res.code || '');
        setOtpCode(res.code || ''); // Pre-fill for quick testing
        setSuccessMsg(res.message || 'Reset code sent to your email.');
        startTimer(30);
      } else {
        setError(res.message || 'No account found with this email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // 3b. Handle Forgot Password - Reset with OTP & New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setLoading(true);

    try {
      const res = (await authAPI.resetPassword({
        email: email.trim().toLowerCase(),
        code: otpCode.trim(),
        newPassword,
      })) as any;

      if (res.success && res.data) {
        const { user, token } = res.data;
        login(user, token);
        addNotification('success', 'Password reset successfully! You are now signed in. 🎉');
        navigate(from === '/admin' ? '/' : from);
      } else {
        setError(res.message || 'Failed to reset password. Check your code and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Reset failed. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    try {
      const res = (await authAPI.sendOtp(email.trim().toLowerCase())) as any;
      if (res.success) {
        setPreviewOtp(res.code || '');
        setOtpCode(res.code || '');
        setSuccessMsg('A new verification code has been sent!');
        startTimer(30);
      }
    } catch (err: any) {
      setError('Failed to resend code.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0D14 0%, #10192A 40%, #162038 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
      }}
    >
      {/* Background glow decoration */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, rgba(255, 107, 53, 0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46, 125, 246, 0.15) 0%, rgba(46, 125, 246, 0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 400px) minmax(360px, 480px)',
          maxWidth: 920,
          width: '100%',
          background: '#FFFFFF',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 30px 90px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.2)',
          position: 'relative',
          zIndex: 1,
        }}
        className="auth-container-grid"
      >
        {/* ── Left Branding Panel (InFlash / Sportika Streetwear Aesthetic) ── */}
        <div
          style={{
            background: 'linear-gradient(160deg, #101828 0%, #0F203C 50%, #1B294B 100%)',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'white',
            position: 'relative',
            borderRight: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                marginBottom: 44,
              }}
            >
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: '2rem',
                  fontStyle: 'italic',
                  letterSpacing: '0.04em',
                  color: 'white',
                }}
              >
                SPORTI<span style={{ color: '#FF6B35' }}>KA</span>
              </span>
            </Link>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 50,
                background: 'rgba(255,107,53,0.18)',
                color: '#FF8A5B',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              <Zap size={12} fill="#FF8A5B" /> {adminNeeded ? 'Admin Console' : 'Member Access'}
            </div>

            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: '1.9rem',
                lineHeight: 1.25,
                marginBottom: 16,
                color: '#FFFFFF',
              }}
            >
              {adminNeeded
                ? 'Authorized Access Required'
                : mode === 'forgot_password'
                ? 'Reset Your Password'
                : mode === 'otp_login'
                ? 'Passwordless Instant Login'
                : 'Engineered for Real Performance.'}
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 32 }}>
              {mode === 'forgot_password'
                ? 'Follow the steps to securely verify your identity with an OTP code and update your password.'
                : mode === 'otp_login'
                ? 'Experience instant 1-click authentication without remembering long passwords.'
                : 'Sign in to access your saved order history, exclusive discounts, wishlist, and fast checkout.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🚀', text: 'Instant Google & OTP Verification' },
                { icon: '📦', text: 'Real-time order tracking & invoices' },
                { icon: '🔒', text: 'End-to-end encrypted password safety' },
                { icon: '⚡', text: 'Exclusive 20% member coupons' },
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.86rem', color: 'rgba(255,255,255,0.85)' }}>
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Database Connection Pill */}
          <div style={{ marginTop: 40 }}>
            {apiOnline !== null && (
              <div
                style={{
                  padding: '9px 14px',
                  borderRadius: 12,
                  background: apiOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${apiOnline ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.75rem',
                  color: apiOnline ? '#4ADE80' : '#F87171',
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: apiOnline ? '#4ADE80' : '#F87171',
                    boxShadow: apiOnline ? '0 0 8px #4ADE80' : 'none',
                  }}
                />
                <span>{apiOnline ? 'Live Backend Connected' : 'Demo Mode (Offline)'}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Action Form Panel ── */}
        <div style={{ padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Header & Tabs */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: '#0F172A', margin: 0 }}>
                {mode === 'forgot_password'
                  ? 'Reset Password'
                  : mode === 'otp_login'
                  ? 'Login via OTP'
                  : 'Welcome Back'}
              </h3>
              {mode !== 'password' && (
                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ChevronLeft size={16} /> Back to Sign In
                </button>
              )}
            </div>

            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '4px 0 0' }}>
              {mode === 'forgot_password' ? (
                'Enter your email to receive a password reset code.'
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: '#FF6B35', fontWeight: 700, textDecoration: 'none' }}>
                    Create account free
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Quick Google Sign In */}
          {mode !== 'forgot_password' && (
            <div style={{ marginBottom: 20 }}>
              <GoogleAuthButton
                label="Continue with Google"
                redirectTo={from === '/admin' ? '/' : from}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '18px 0 8px',
                  gap: 12,
                  color: '#94A3B8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                <span>or continue with email</span>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              </div>

              {/* Login Method Pills (Password vs OTP) */}
              <div
                style={{
                  display: 'flex',
                  background: '#F1F5F9',
                  borderRadius: 12,
                  padding: 4,
                  marginTop: 14,
                  gap: 4,
                }}
              >
                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 9,
                    border: 'none',
                    background: mode === 'password' ? '#FFFFFF' : 'transparent',
                    color: mode === 'password' ? '#0F172A' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: mode === 'password' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('otp_login')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 9,
                    border: 'none',
                    background: mode === 'otp_login' ? '#FFFFFF' : 'transparent',
                    color: mode === 'otp_login' ? '#0F172A' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: mode === 'otp_login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  Email OTP Code
                </button>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 18,
                color: '#DC2626',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 18,
                color: '#16A34A',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Development / Test OTP Preview Helper */}
          {previewOtp && (
            <div
              style={{
                background: 'linear-gradient(135deg, #EFF6FF, #EEF2FF)',
                border: '1.5px dashed #6366F1',
                borderRadius: 12,
                padding: '10px 14px',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                color: '#4338CA',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <KeyRound size={15} />
                <span>Verification OTP:</span>
                <strong style={{ letterSpacing: 2, fontSize: '1rem', color: '#1E1B4B' }}>{previewOtp}</strong>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(previewOtp)}
                style={{
                  background: '#6366F1',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Auto Fill
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              MODE 1: STANDARD EMAIL & PASSWORD
          ═══════════════════════════════════════════════════ */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: 42, borderRadius: 12, height: 46, fontSize: '0.92rem' }}
                    id="login-email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot_password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#FF6B35',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: 42, paddingRight: 42, borderRadius: 12, height: 46, fontSize: '0.92rem' }}
                    id="login-password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="login-submit"
                style={{
                  marginTop: 6,
                  height: 48,
                  borderRadius: 12,
                  background: '#0F172A',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════
              MODE 2: ONE-TIME OTP LOGIN (InFlash Style)
          ═══════════════════════════════════════════════════ */}
          {mode === 'otp_login' && (
            <div>
              {otpStep === 1 ? (
                <form onSubmit={handleSendLoginOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      Enter your Registered Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ paddingLeft: 42, borderRadius: 12, height: 46 }}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      height: 48,
                      borderRadius: 12,
                      background: '#FF6B35',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(255,107,53,0.3)',
                    }}
                  >
                    {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send 6-Digit Login Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyLoginOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Code sent to:</div>
                    <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{email}</strong>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      style={{
                        textAlign: 'center',
                        letterSpacing: 10,
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '1.4rem',
                        height: 52,
                        borderRadius: 12,
                        border: '2px solid #CBD5E1',
                        width: '100%',
                      }}
                      autoFocus
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: countdown > 0 ? '#94A3B8' : '#FF6B35',
                        fontWeight: 600,
                        cursor: countdown > 0 ? 'default' : 'pointer',
                        padding: 0,
                      }}
                    >
                      {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      height: 48,
                      borderRadius: 12,
                      background: '#0F172A',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Verify Code & Sign In'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              MODE 3: FORGOT PASSWORD FLOW
          ═══════════════════════════════════════════════════ */}
          {mode === 'forgot_password' && (
            <div>
              {otpStep === 1 ? (
                <form onSubmit={handleRequestPasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      Account Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ paddingLeft: 42, borderRadius: 12, height: 46 }}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      height: 48,
                      borderRadius: 12,
                      background: '#FF6B35',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(255,107,53,0.3)',
                    }}
                  >
                    {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Reset Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Reset code sent to:</div>
                    <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{email}</strong>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      6-Digit Reset Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      style={{
                        textAlign: 'center',
                        letterSpacing: 10,
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '1.4rem',
                        height: 50,
                        borderRadius: 12,
                        border: '2px solid #CBD5E1',
                        width: '100%',
                      }}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      Create New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        className="form-input"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ paddingLeft: 42, paddingRight: 42, borderRadius: 12, height: 46 }}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass((v) => !v)}
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94A3B8',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {showNewPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: countdown > 0 ? '#94A3B8' : '#FF6B35',
                        fontWeight: 600,
                        cursor: countdown > 0 ? 'default' : 'pointer',
                        padding: 0,
                      }}
                    >
                      {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      height: 48,
                      borderRadius: 12,
                      background: '#0F172A',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Update Password & Sign In'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Helper Box */}
          <div
            style={{
              marginTop: 22,
              padding: '12px 14px',
              background: '#F8FAFC',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ color: '#64748B' }}>
              <strong>Admin Portal?</strong> admin@sportika.in
            </div>
            <button
              type="button"
              onClick={() => {
                switchMode('password');
                setEmail('admin@sportika.in');
                setPassword('Admin@Sportika2024');
              }}
              style={{
                background: 'none',
                border: '1px solid #CBD5E1',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#FF6B35',
                cursor: 'pointer',
              }}
            >
              Fill Admin
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-container-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
