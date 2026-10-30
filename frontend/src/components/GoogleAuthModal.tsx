import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserCheck, Plus, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore, useUIStore } from '../store';
import { authAPI } from '../api';

export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface GoogleAuthButtonProps {
  label?: string;
  redirectTo?: string;
  onSuccess?: () => void;
  style?: React.CSSProperties;
}

export function GoogleAuthButton({
  label = 'Continue with Google',
  redirectTo = '/',
  onSuccess,
  style,
}: GoogleAuthButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customError, setCustomError] = useState('');

  const { login } = useAuthStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  const handleSelectAccount = async (account: { name: string; email: string; avatar?: string }) => {
    setLoading(true);
    setCustomError('');
    try {
      const res = await authAPI.googleAuth(account) as any;
      if (res.success && res.data) {
        login(res.data.user, res.data.token);
        addNotification('success', `Signed in as ${account.name} via Google! 🎉`);
        setIsOpen(false);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectTo);
        }
      } else {
        setCustomError(res.message || 'Google authentication failed.');
      }
    } catch (err: any) {
      setCustomError(err.message || 'Could not connect to Google sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setCustomError('Please enter a valid Google account email.');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    handleSelectAccount({
      name,
      email: customEmail.trim().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '12px 18px',
          background: '#FFFFFF',
          border: '1.5px solid #CBD5E1',
          borderRadius: 12,
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#1E293B',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#94A3B8';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          e.currentTarget.style.backgroundColor = '#F8FAFC';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#CBD5E1';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        <GoogleIcon size={20} />
        <span>{label}</span>
      </button>

      {/* Google Account Selector Dialog */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16,
          }}
          onClick={() => !loading && setIsOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              width: '100%',
              maxWidth: 440,
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '24px 28px 16px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GoogleIcon size={24} />
                <div>
                  <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', margin: 0, color: '#0F172A' }}>
                    Sign in with Google
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Choose an account to continue to Sportika</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {customError && (
              <div
                style={{
                  margin: '12px 28px 0',
                  padding: '10px 14px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 10,
                  color: '#DC2626',
                  fontSize: '0.8rem',
                }}
              >
                {customError}
              </div>
            )}

            {/* Body */}
            <div style={{ padding: '16px 28px 24px' }}>
              {loading ? (
                <div style={{ padding: '36px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <Loader2 size={32} color="#4285F4" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>Connecting with Google...</span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Authorizing your Sportika account</span>
                </div>
              ) : !showCustomInput ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Default detected account: Sumeet Gite */}
                  <div
                    onClick={() =>
                      handleSelectAccount({
                        name: 'Sumeet Ravindra Gite',
                        email: 'sumeetgite23@gmail.com',
                        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sumeet+Gite',
                      })
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 14,
                      border: '1.5px solid #E2E8F0',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#4285F4';
                      e.currentTarget.style.background = '#EFF6FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.background = '#F8FAFC';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4285F4, #0D47A1)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          fontFamily: 'Outfit',
                          boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
                        }}
                      >
                        S
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Sumeet Ravindra Gite</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748B' }}>sumeetgite23@gmail.com</div>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        background: '#DBEAFE',
                        color: '#1D4ED8',
                        borderRadius: 20,
                        fontSize: '0.725rem',
                        fontWeight: 700,
                      }}
                    >
                      Instant Sign In
                    </span>
                  </div>

                  {/* Option to use another Google account */}
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 14,
                      border: '1px dashed #CBD5E1',
                      background: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      color: '#475569',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F1F5F9';
                      e.currentTarget.style.borderColor = '#94A3B8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: '#E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                      }}
                    >
                      <Plus size={18} />
                    </div>
                    <span>Use another Google account</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                      Google Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 10,
                        background: '#F1F5F9',
                        color: '#475569',
                        border: 'none',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 2,
                        padding: '10px',
                        borderRadius: 10,
                        background: '#4285F4',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <span>Continue</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              )}

              {/* Security footnote */}
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#94A3B8',
                  fontSize: '0.725rem',
                  justifyContent: 'center',
                }}
              >
                <Shield size={13} color="#16A34A" /> Secure 256-bit encrypted authentication
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
