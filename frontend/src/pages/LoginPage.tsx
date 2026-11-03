import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Zap, AlertCircle,
  CheckCircle, RefreshCw, KeyRound, Sparkles, ChevronLeft, User, Phone
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store';
import { authAPI, checkAPIHealth } from '../api';
import { GoogleAuthButton } from '../components/GoogleAuthModal';

type AuthTab = 'login' | 'register' | 'otp_login' | 'forgot_password';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  // OTP / Forgot Password states
  const [otpEmail, setOtpEmail] = useState('');
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [previewOtp, setPreviewOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // General states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  const { login } = useAuthStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';
  const adminNeeded = (location.state as any)?.adminNeeded;

  const timerRef = useRef<ReturnType<typeof setInterval>>();

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
    // If arriving with ?mode=register or state
    if (location.pathname === '/register' || (location.state as any)?.mode === 'register') {
      setActiveTab('register');
    }
    if ((location.state as any)?.prefillEmail) {
      setLoginEmail((location.state as any).prefillEmail);
      setActiveTab('login');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [location]);

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMsg('');
    setOtpStep(1);
    setOtpCode('');
    setPreviewOtp('');
  };

  // 1. Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!loginEmail || !loginPassword) {
      setError('Please enter both your email and password.');
      return;
    }
    setLoading(true);

    try {
      const result = (await authAPI.login({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
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

  // 2. Direct Account Creation (Sign Up)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = (await authAPI.register({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        phone: regPhone.trim() || undefined,
      })) as any;

      if (result.success && result.data) {
        const { user, token } = result.data;
        login(user, token);
        addNotification('success', `Welcome to Sportika, ${regName.split(' ')[0]}! Your account is created. 🎉`);
        navigate(from === '/admin' ? '/' : from);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. OTP Login - Request Code
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!otpEmail || !otpEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);

    try {
      const res = (await authAPI.sendOtp(otpEmail.trim().toLowerCase())) as any;
      if (res.success) {
        setOtpStep(2);
        setPreviewOtp(res.code || '');
        setOtpCode(res.code || '');
        setSuccessMsg(`Verification code sent to ${otpEmail}`);
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

  // 3b. OTP Login - Verify Code & Log In
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);

    try {
      const res = (await authAPI.verifyOtp(otpEmail.trim().toLowerCase(), otpCode.trim())) as any;
      if (res.success && res.data) {
        const { user, token } = res.data;
        login(user, token);
        addNotification('success', `Signed in as ${user.name}! 🚀`);
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

  // 4. Forgot Password - Request Reset Code
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!otpEmail || !otpEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);

    try {
      const res = (await authAPI.forgotPassword(otpEmail.trim().toLowerCase())) as any;
      if (res.success) {
        setOtpStep(2);
        setPreviewOtp(res.code || '');
        setOtpCode(res.code || '');
        setSuccessMsg(res.message || 'Reset code sent to your email.');
        startTimer(30);
      } else {
        setError(res.message || 'No account found with this email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  // 4b. Forgot Password - Reset with OTP & New Password
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
        email: otpEmail.trim().toLowerCase(),
        code: otpCode.trim(),
        newPassword,
      })) as any;

      if (res.success && res.data) {
        const { user, token } = res.data;
        login(user, token);
        addNotification('success', 'Password reset successfully! You are now signed in. 🎉');
        navigate(from === '/admin' ? '/' : from);
      } else {
        setError(res.message || 'Failed to reset password. Check code.');
      }
    } catch (err: any) {
      setError(err.message || 'Reset failed. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    try {
      const res = (await authAPI.sendOtp(otpEmail.trim().toLowerCase())) as any;
      if (res.success) {
        setPreviewOtp(res.code || '');
        setOtpCode(res.code || '');
        setSuccessMsg('A new verification code has been sent!');
        startTimer(30);
      }
    } catch {
      setError('Failed to resend code.');
    }
  };

  const regStrength =
    regPassword.length >= 8 && /[A-Z]/.test(regPassword) && /[0-9]/.test(regPassword)
      ? 'strong'
      : regPassword.length >= 6
      ? 'medium'
      : 'weak';
  const regStrengthColor =
    regStrength === 'strong' ? '#22C55E' : regStrength === 'medium' ? '#F59E0B' : '#EF4444';

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
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '12%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, rgba(255, 107, 53, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '12%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61, 82, 213, 0.15) 0%, rgba(61, 82, 213, 0) 70%)',
          filter: 'blur(50px)',
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
                : activeTab === 'register'
                ? 'Join the Sportika Family!'
                : activeTab === 'forgot_password'
                ? 'Reset Your Password'
                : activeTab === 'otp_login'
                ? 'Passwordless Instant Login'
                : 'Engineered for Real Performance.'}
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 32 }}>
              {activeTab === 'register'
                ? 'Create your free account today to enjoy 20% off your first sportswear order, live tracking, and seamless checkout.'
                : activeTab === 'forgot_password'
                ? 'Enter your registered email to receive an instant verification code and update your password securely.'
                : activeTab === 'otp_login'
                ? 'Experience fast 1-click authentication using a one-time verification code without passwords.'
                : 'Sign in to access your saved order history, exclusive discounts, wishlist, and fast checkout.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🎁', text: '20% off your first sports order' },
                { icon: '🚀', text: 'Instant Google & OTP Verification' },
                { icon: '📦', text: 'Live tracking & tax invoice downloads' },
                { icon: '🔒', text: '100% secure encrypted account storage' },
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
                <span>{apiOnline ? 'Live Backend Connected' : 'Resilient Client Database Active'}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Action Form Panel ── */}
        <div style={{ padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Header Title */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: '#0F172A', margin: 0 }}>
                {activeTab === 'register'
                  ? 'Create Account'
                  : activeTab === 'forgot_password'
                  ? 'Reset Password'
                  : activeTab === 'otp_login'
                  ? 'Login via OTP'
                  : 'Sign In'}
              </h3>
              {activeTab === 'forgot_password' && (
                <button
                  type="button"
                  onClick={() => switchTab('login')}
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

            <p style={{ color: '#64748B', fontSize: '0.86rem', margin: '4px 0 0' }}>
              {activeTab === 'register' ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    style={{ background: 'none', border: 'none', color: '#FF6B35', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Sign in here
                  </button>
                </>
              ) : activeTab === 'forgot_password' ? (
                'Enter your email to receive a password reset code.'
              ) : (
                <>
                  New to Sportika?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('register')}
                    style={{ background: 'none', border: 'none', color: '#FF6B35', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Create account free
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Quick Google Sign In */}
          {activeTab !== 'forgot_password' && (
            <div style={{ marginBottom: 18 }}>
              <GoogleAuthButton
                label={activeTab === 'register' ? 'Sign up directly with Google' : 'Continue with Google'}
                redirectTo={from === '/admin' ? '/' : from}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '16px 0 12px',
                  gap: 12,
                  color: '#94A3B8',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                <span>or continue with email</span>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              </div>

              {/* 3-Tab Switcher: Sign In | Create Account | OTP Login */}
              <div
                style={{
                  display: 'flex',
                  background: '#F1F5F9',
                  borderRadius: 12,
                  padding: 4,
                  gap: 4,
                }}
              >
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  style={{
                    flex: 1,
                    padding: '8px 8px',
                    borderRadius: 9,
                    border: 'none',
                    background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'login' ? '#0F172A' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: activeTab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  style={{
                    flex: 1,
                    padding: '8px 8px',
                    borderRadius: 9,
                    border: 'none',
                    background: activeTab === 'register' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'register' ? '#0F172A' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: activeTab === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('otp_login')}
                  style={{
                    flex: 1,
                    padding: '8px 8px',
                    borderRadius: 9,
                    border: 'none',
                    background: activeTab === 'otp_login' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'otp_login' ? '#0F172A' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: activeTab === 'otp_login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  Quick OTP
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 16,
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

          {/* Success Message */}
          {successMsg && (
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 16,
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

          {/* Preview OTP Helper (for instant seamless testing) */}
          {previewOtp && (
            <div
              style={{
                background: 'linear-gradient(135deg, #EFF6FF, #EEF2FF)',
                border: '1.5px dashed #6366F1',
                borderRadius: 12,
                padding: '10px 14px',
                marginBottom: 16,
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
              TAB 1: SIGN IN (PASSWORD)
          ═══════════════════════════════════════════════════ */}
          {activeTab === 'login' && (
            <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
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
                    onClick={() => {
                      setOtpEmail(loginEmail);
                      switchTab('forgot_password');
                    }}
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
                    type={showLoginPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ paddingLeft: 42, paddingRight: 42, borderRadius: 12, height: 46, fontSize: '0.92rem' }}
                    id="login-password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((v) => !v)}
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
                    {showLoginPass ? <EyeOff size={17} /> : <Eye size={17} />}
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
                {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════
              TAB 2: CREATE ACCOUNT (INSTANT SIGN UP)
          ═══════════════════════════════════════════════════ */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{ paddingLeft: 42, borderRadius: 12, height: 44, fontSize: '0.92rem' }}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ paddingLeft: 42, borderRadius: 12, height: 44, fontSize: '0.92rem' }}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                    Password *
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Min. 6 characters</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingLeft: 42, paddingRight: 42, borderRadius: 12, height: 44, fontSize: '0.92rem' }}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass((v) => !v)}
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
                    {showRegPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {regPassword && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['weak', 'medium', 'strong'].map((s, i) => (
                        <div
                          key={s}
                          style={{
                            flex: 1,
                            height: 3,
                            borderRadius: 2,
                            background: i <= ['weak', 'medium', 'strong'].indexOf(regStrength) ? regStrengthColor : '#E2E8F0',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone (Optional) */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  Phone Number <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={{ paddingLeft: 42, borderRadius: 12, height: 44, fontSize: '0.92rem' }}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="create-account-submit"
                style={{
                  marginTop: 6,
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
                  boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Account 🚀'}
              </button>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════
              TAB 3: QUICK EMAIL OTP LOGIN (InFlash Style)
          ═══════════════════════════════════════════════════ */}
          {activeTab === 'otp_login' && (
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
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
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
                    <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{otpEmail}</strong>
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
              TAB 4: FORGOT PASSWORD FLOW
          ═══════════════════════════════════════════════════ */}
          {activeTab === 'forgot_password' && (
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
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
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
                    <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{otpEmail}</strong>
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
              <strong>Admin Portal:</strong> sumeetgite23@gmail.com
            </div>
            <button
              type="button"
              onClick={() => {
                switchTab('login');
                setLoginEmail('sumeetgite23@gmail.com');
                setLoginPassword('Admin@Sportika2024');
              }}
              style={{
                background: '#FF6B35',
                border: 'none',
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(255,107,53,0.3)',
              }}
            >
              Fill Admin Sumeet
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
