import React, { useState } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Smartphone,
  Info
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string, newPass: string) => void;
  apiBase: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  apiBase
}) => {
  // Step 1: Identifier Input -> Step 2: OTP & New Password -> Step 3: Success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Step 2 Form States
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  if (!isOpen) return null;

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your Username, Registered Email, or Mobile Phone.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await axios.post(`${apiBase}/auth/forgot-password/request`, {
        identifier: identifier.trim()
      }, { timeout: 6000 });

      if (res.data && res.data.status === 'otp_dispatched') {
        setUserId(res.data.user_id);
        setUsername(res.data.username);
        setMaskedEmail(res.data.masked_email);
        setMaskedPhone(res.data.masked_phone);
        setDevOtp(res.data.dev_otp);
        setStep(2);
        setResendTimer(60);
        // Resend countdown
        const interval = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to dispatch verification OTP.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('Please enter the valid 6-digit OTP code.');
      return;
    }
    if (newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await axios.post(`${apiBase}/auth/forgot-password/verify`, {
        user_id: userId,
        otp: otp.trim(),
        new_password: newPassword
      }, { timeout: 6000 });

      if (res.data && res.data.status === 'password_updated') {
        setStep(3);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'OTP verification or password update failed.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess(username, newPassword);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              <img
                src="/favicon.ico"
                alt="V-NMS Favicon"
                style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/favicon.png';
                }}
              />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                {step === 3 ? 'Password Updated' : 'Reset Password (OTP)'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {step === 1 && 'Enter your username, email, or mobile to get OTP'}
                {step === 2 && `Enter 6-digit OTP sent to ${username}`}
                {step === 3 && 'Account secured with your new password'}
              </p>
            </div>
          </div>
          {step !== 3 && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '4px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px' }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.84rem',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Identifier */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Username, Registered Email, or Mobile Number
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px',
                  backgroundColor: '#ffffff'
                }}>
                  <Smartphone size={16} color="#64748b" style={{ marginRight: '10px' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin, operator, or 9876543210"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 0',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.9rem',
                      color: '#0f172a'
                    }}
                    autoFocus
                  />
                </div>
                <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>
                  We will send a 6-digit verification code to both your registered Email and Mobile Phone.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification OTP</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Delivery Info Box */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>
                  <CheckCircle2 size={15} color="#16a34a" />
                  <span>OTP Dispatched Successfully!</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#334155', marginTop: '2px' }}>
                  <span>📧 Email: <strong>{maskedEmail}</strong></span>
                  <span>📱 Mobile: <strong>{maskedPhone}</strong></span>
                </div>
              </div>

              {/* Offline Server Room Dev Banner */}
              {devOtp && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#1e40af' }}>
                    <Info size={14} color="#3b82f6" />
                    <span>Local Server Room / Offline OTP:</span>
                  </div>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#1e40af',
                    color: '#ffffff'
                  }}>
                    {devOtp}
                  </span>
                </div>
              )}

              {/* 6-Digit OTP Field */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    6-Digit OTP Verification Code
                  </label>
                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={handleRequestOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendTimer > 0 ? '#94a3b8' : '#0284c7',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: resendTimer > 0 ? 'default' : 'pointer'
                    }}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #0284c7',
                    borderRadius: '8px',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: '0.3em',
                    color: '#0f172a'
                  }}
                  autoFocus
                />
              </div>

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  New Password
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px'
                }}>
                  <Lock size={16} color="#64748b" style={{ marginRight: '8px' }} />
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.88rem',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px'
                }}>
                  <Lock size={16} color="#64748b" style={{ marginRight: '8px' }} />
                  <input
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.88rem',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Verify OTP & Save Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '12px 0'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={36} color="#16a34a" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Password Updated Successfully!
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 24px 0', maxWidth: '340px' }}>
                User <strong>{username}</strong> can now log in using the newly created password.
              </p>
              <button
                type="button"
                onClick={handleFinish}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
                }}
              >
                Sign In with New Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
