import React, { useState } from 'react';
import axios from 'axios';
import { 
  KeyRound, 
  Lock, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import type { AuthUser } from '../types';
import { useToast } from '../context/ToastContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser | null;
  apiBase: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  apiBase
}) => {
  const toast = useToast();
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');

  // Form State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setErrorMsg(null);
    setOtpLoading(true);

    try {
      const token = localStorage.getItem('vnms_session') 
        ? JSON.parse(localStorage.getItem('vnms_session')!).token 
        : '';

      const res = await axios.post(`${apiBase}/auth/change-password/request-otp`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      if (res.data && res.data.status === 'otp_sent') {
        setOtpSent(true);
        setDevOtp(res.data.dev_otp);
        setMaskedEmail(res.data.masked_email);
        setMaskedPhone(res.data.masked_phone);
        toast.info('Security OTP sent to your registered Email & Mobile.', 'OTP Dispatched');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to dispatch verification OTP.';
      setErrorMsg(msg);
      toast.error(msg, 'OTP Error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authMethod === 'password' && !currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (authMethod === 'otp' && (!otp || otp.length !== 6)) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    if (newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('vnms_session') 
        ? JSON.parse(localStorage.getItem('vnms_session')!).token 
        : '';

      const res = await axios.post(`${apiBase}/auth/change-password`, {
        current_password: authMethod === 'password' ? currentPassword : '',
        otp: authMethod === 'otp' ? otp : '',
        new_password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 6000
      });

      if (res.data && res.data.status === 'password_changed') {
        setSuccess(true);
        toast.success('Your password has been successfully updated!', 'Password Changed');
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setOtp('');
          setOtpSent(false);
        }, 1800);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to change password.';
      setErrorMsg(msg);
      toast.error(msg, 'Change Failed');
    } finally {
      setLoading(false);
    }
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
          padding: '22px 28px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(2, 132, 199, 0.2)',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <KeyRound size={20} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Change Account Password</h2>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                User: <strong>{currentUser?.username || 'Current User'}</strong> ({currentUser?.role || 'operator'})
              </p>
            </div>
          </div>
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
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px 28px' }}>
          {success ? (
            <div style={{
              padding: '24px 0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <CheckCircle2 size={44} color="#16a34a" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                Password Updated Successfully!
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Your new password is now saved and active.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {errorMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.82rem'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Verification Method Tabs */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Verification Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('password')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: authMethod === 'password' ? '#0284c7' : '#cbd5e1',
                      background: authMethod === 'password' ? '#f0f9ff' : '#ffffff',
                      color: authMethod === 'password' ? '#0369a1' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Current Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('otp');
                      if (!otpSent) handleSendOtp();
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: authMethod === 'otp' ? '#0284c7' : '#cbd5e1',
                      background: authMethod === 'otp' ? '#f0f9ff' : '#ffffff',
                      color: authMethod === 'otp' ? '#0369a1' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Mobile/Email OTP
                  </button>
                </div>
              </div>

              {/* Method 1: Current Password */}
              {authMethod === 'password' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Current Password
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0 12px'
                  }}>
                    <Lock size={15} color="#64748b" style={{ marginRight: '8px' }} />
                    <input
                      type="password"
                      required
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 0',
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.86rem',
                        color: '#0f172a'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Method 2: Mobile / Email OTP */}
              {authMethod === 'otp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {otpSent && (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      fontSize: '0.74rem',
                      color: '#166534'
                    }}>
                      OTP dispatched to: <strong>{maskedEmail}</strong> & <strong>{maskedPhone}</strong>
                    </div>
                  )}

                  {devOtp && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.76rem',
                      color: '#1e40af'
                    }}>
                      <span>Local Room OTP:</span>
                      <strong style={{ fontSize: '0.95rem', letterSpacing: '0.1em' }}>{devOtp}</strong>
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                        6-Digit OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: otpLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {otpLoading ? 'Sending...' : 'Resend OTP'}
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
                        padding: '9px 12px',
                        border: '2px solid #0284c7',
                        borderRadius: '8px',
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        letterSpacing: '0.25em',
                        color: '#0f172a'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  New Password
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px'
                }}>
                  <Lock size={15} color="#64748b" style={{ marginRight: '8px' }} />
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 0',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.86rem',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px'
                }}>
                  <Lock size={15} color="#64748b" style={{ marginRight: '8px' }} />
                  <input
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 0',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.86rem',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.84rem',
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
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
