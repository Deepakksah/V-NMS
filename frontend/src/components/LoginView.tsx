import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  KeyRound, 
  Database
} from 'lucide-react';
import type { AuthSession } from '../types';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginViewProps {
  onLoginSuccess: (session: AuthSession) => void;
  apiBase: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, apiBase }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Synchronize document title and favicon dynamically during login time
  useEffect(() => {
    document.title = loading ? 'Authenticating... • V-NMS Enterprise' : 'Sign In • V-NMS Enterprise';
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/x-icon';
    link.href = '/favicon.ico';
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await axios.post(`${apiBase}/auth/login`, {
        username: username.trim(),
        password: password
      }, { timeout: 4000 });

      if (res.data && res.data.token && res.data.user) {
        const session: AuthSession = {
          token: res.data.token,
          tokenType: res.data.token_type || 'Bearer',
          expiresIn: res.data.expires_in || 86400,
          user: res.data.user
        };
        onLoginSuccess(session);
      } else {
        setErrorMsg('Authentication response format invalid.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else if (err.code === 'ERR_NETWORK') {
        setErrorMsg('Cannot reach V-NMS backend server at ' + apiBase + '. Ensure PostgreSQL and server are running.');
      } else {
        setErrorMsg('Login failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, #f1f5f9 1px)',
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0, 12px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#0f172a'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Brand Banner Header with Official Favicon */}
        <div style={{
          padding: '28px 32px 22px 32px',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Favicon Emblem */}
          <div style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '14px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.22), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              padding: '8px'
            }}>
              <img
                src="/favicon.ico"
                alt="V-NMS Favicon"
                style={{
                  width: '42px',
                  height: '42px',
                  objectFit: 'contain',
                  display: 'block'
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/favicon.png';
                }}
              />
            </div>
            {/* Live Gateway Telemetry Indicator on Favicon */}
            <span
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: loading ? '#f59e0b' : '#10b981',
                border: '2.5px solid #ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }}
              title={loading ? 'Authenticating credentials...' : 'NOC Telemetry Gateway Active'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a', margin: 0 }}>
              V-NMS
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd'
            }}>
              ENTERPRISE
            </span>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Network Management & Autonomous Telemetry Engine
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 32px 32px 32px' }}>
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Username / Email field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px'
              }}>
                Username or Email
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                padding: '0 12px',
                transition: 'border-color 0.15s ease'
              }}>
                <User size={16} color="#64748b" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  required
                  placeholder="deepak.sah or email"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    background: 'transparent'
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155'
                }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.76rem',
                    color: '#0284c7',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0
                  }}
                >
                  Forgot password? (OTP Reset)
                </button>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                padding: '0 12px'
              }}>
                <Lock size={16} color="#64748b" style={{ marginRight: '8px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    background: 'transparent'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#0284c7', borderRadius: '4px' }}
                />
                <span>Keep session active (24 hours)</span>
              </label>
            </div>

            {/* Submit Button with Favicon Integration */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                transition: 'opacity 0.15s ease'
              }}
            >
              {loading ? (
                <>
                  <img
                    src="/favicon.ico"
                    alt="Authenticating"
                    style={{
                      width: '18px',
                      height: '18px',
                      objectFit: 'contain',
                      display: 'inline-block',
                      animation: 'spin 1.2s linear infinite'
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/favicon.png';
                    }}
                  />
                  <span>Authenticating Session...</span>
                </>
              ) : (
                <>
                  <img
                    src="/favicon.ico"
                    alt="Favicon"
                    style={{
                      width: '18px',
                      height: '18px',
                      objectFit: 'contain',
                      display: 'inline-block',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))'
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/favicon.png';
                    }}
                  />
                  <span>Sign In to V-NMS</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: '26px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <p style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <KeyRound size={13} color="#0284c7" />
              <span>Quick Test Accounts</span>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: username === 'admin' ? '#e0f2fe' : '#ffffff',
                  borderColor: username === 'admin' ? '#38bdf8' : '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>admin</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0284c7', background: '#dbeafe', padding: '1px 4px', borderRadius: '4px' }}>
                    ROOT
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>SuperAdmin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('deepak.sah', 'admin123')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: username === 'deepak.sah' ? '#e0f2fe' : '#ffffff',
                  borderColor: username === 'deepak.sah' ? '#38bdf8' : '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>deepak.sah</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0284c7', background: '#dbeafe', padding: '1px 4px', borderRadius: '4px' }}>
                    ADMIN
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>SuperAdmin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('operator', 'operator123')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: username === 'operator' ? '#f0fdf4' : '#ffffff',
                  borderColor: username === 'operator' ? '#4ade80' : '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>operator</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 4px', borderRadius: '4px' }}>
                    OP
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Operator</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Database size={13} color="#16a34a" />
            <span>PostgreSQL 18 RBAC</span>
          </span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} color="#0284c7" />
            <span>JWT 256-bit Session</span>
          </span>
        </div>
      </div>

      {/* Interactive Mobile & Email OTP Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSuccess={(u, p) => {
          setUsername(u);
          setPassword(p);
        }}
        apiBase={apiBase}
      />
    </div>
  );
};
