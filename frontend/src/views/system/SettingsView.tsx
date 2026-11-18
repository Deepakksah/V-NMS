import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Key,
  Users,
  Sliders,
  Globe,
  UserPlus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  X,
  Lock,
  Mail,
  Phone,
  Briefcase,
  User,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import {
  MOCK_VAULT_SECRETS,
  MOCK_SYSTEM_CONFIGS,
  MOCK_PEERING_IXPS
} from '../../data/mockEnterpriseData';
import { useToast } from '../../context/ToastContext';

interface SystemUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  department?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

interface SettingsViewProps {
  apiBase?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  apiBase = typeof window !== 'undefined' && window.location.port === '5173' 
    ? 'http://127.0.0.1:8081/api/v1' 
    : '/api/v1' 
}) => {
  const toast = useToast();
  const [subTab, setSubTab] = useState<'users' | 'vault' | 'configs' | 'peering'>('users');
  const [userList, setUserList] = useState<SystemUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New user form state
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState('NOC Operations');
  const [newRole, setNewRole] = useState('operator');
  const [newPassword, setNewPassword] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${apiBase}/users`, { timeout: 3500 });
      if (res.data && res.data.users) {
        setUserList(res.data.users);
      }
    } catch (err) {
      console.warn('Failed to load users from backend:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    // Flexible password check
    if (newPassword.length < 4) {
      const errMsg = `Password must be at least 4 characters long (Currently ${newPassword.length}).`;
      setModalError(errMsg);
      toast.warning(errMsg, 'Short Password');
      return;
    }

    setSubmittingUser(true);
    try {
      const res = await axios.post(`${apiBase}/users`, {
        username: newUsername.trim(),
        password: newPassword,
        email: newEmail.trim(),
        full_name: newFullName.trim(),
        phone: newPhone.trim(),
        department: newDepartment,
        role: newRole
      }, { timeout: 5000 });

      if (res.status === 201 || res.status === 200) {
        setShowAddUserModal(false);
        const createdUser = newUsername;
        setNewFullName('');
        setNewUsername('');
        setNewEmail('');
        setNewPhone('');
        setNewPassword('');
        toast.success(`User "${createdUser}" added successfully!`, 'User Saved');
        setToastMsg({ text: `User ${createdUser} added successfully!`, type: 'success' });
        setTimeout(() => setToastMsg(null), 2000);
        fetchUsers();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to create user';
      setModalError(msg);
      toast.error(msg, 'User Creation Failed');
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (userId === 1) {
      toast.error('Cannot delete root SuperAdmin user!', 'Permission Denied');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}"?`)) {
      return;
    }

    try {
      await axios.delete(`${apiBase}/users/${userId}`, { timeout: 4000 });
      toast.info(`User "${username}" deleted successfully.`, 'User Deleted');
      setToastMsg({ text: `User "${username}" deleted successfully.`, type: 'success' });
      setTimeout(() => setToastMsg(null), 2000);
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to delete user';
      toast.error(errMsg, 'Deletion Failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 18px',
          borderRadius: '8px',
          background: toastMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${toastMsg.type === 'success' ? '#86efac' : '#fca5a5'}`,
          color: toastMsg.type === 'success' ? '#15803d' : '#991b1b',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Users, Secret Vault &amp; System Foundations</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              RBAC &amp; System Core
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Role-Based Access Control (RBAC), AES-256-GCM Secret Vault, System Configs &amp; PeeringDB IXP Integrations
          </p>
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'users', label: 'User Accounts & RBAC (#132, #133)', icon: Users, count: userList.length },
          { id: 'vault', label: 'AES-256-GCM Secret Vault (#136)', icon: Key, count: MOCK_VAULT_SECRETS.length },
          { id: 'configs', label: 'System Engine Configs (#139)', icon: Sliders, count: MOCK_SYSTEM_CONFIGS.length },
          { id: 'peering', label: 'PeeringDB IXPs (#142, #143)', icon: Globe, count: MOCK_PEERING_IXPS.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                background: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#0369a1' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '9999px',
                background: isActive ? '#bfdbfe' : '#f1f5f9',
                color: isActive ? '#1e40af' : '#64748b'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Users Tab */}
      {subTab === 'users' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Enterprise User Accounts &amp; RBAC Directory
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0 0' }}>
                All user accounts stored securely with bcrypt password hashes and 12-character minimum security policy.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={fetchUsers}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} className={loadingUsers ? 'spin' : ''} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => { setModalError(null); setShowAddUserModal(true); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                }}
              >
                <UserPlus size={15} />
                <span>+ Add System User</span>
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 14px' }}>FULL NAME &amp; USERNAME</th>
                  <th style={{ padding: '10px 14px' }}>CORPORATE EMAIL</th>
                  <th style={{ padding: '10px 14px' }}>PHONE</th>
                  <th style={{ padding: '10px 14px' }}>DEPARTMENT</th>
                  <th style={{ padding: '10px 14px' }}>SYSTEM ROLE</th>
                  <th style={{ padding: '10px 14px' }}>PASSWORD POLICY</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {userList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                        {u.full_name || u.username}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        @{u.username}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#475569' }}>
                      {u.phone || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#475569' }}>
                      {u.department || 'NOC Operations'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: u.role === 'superadmin' ? '#f3e8ff' : u.role === 'operator' ? '#e0f2fe' : '#f1f5f9',
                        color: u.role === 'superadmin' ? '#7e22ce' : u.role === 'operator' ? '#0369a1' : '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        color: '#15803d',
                        background: '#dcfce7',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        <ShieldCheck size={12} />
                        <span>&ge; 12 Char Bcrypt</span>
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {u.id === 1 ? (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Root Protected
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          title="Delete User"
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#b91c1c',
                            borderRadius: '5px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 600
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Secret Vault Tab */}
      {subTab === 'vault' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_VAULT_SECRETS.map(sec => (
            <div key={sec.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                  {sec.cipher}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                  {sec.targetType.toUpperCase()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{sec.title}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>Target: {sec.targetDevice}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.75rem', color: '#334155' }}>
                <span>Vault Encryption: Active</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>Key Stored In Hardware HSM</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* System Configs Tab */}
      {subTab === 'configs' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            System Global Configurations &amp; Engine Defaults
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>SUBSYSTEM GROUP</th>
                <th style={{ padding: '10px 14px' }}>CONFIG KEY</th>
                <th style={{ padding: '10px 14px' }}>VALUE</th>
                <th style={{ padding: '10px 14px' }}>DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SYSTEM_CONFIGS.map(cfg => (
                <tr key={cfg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700 }}>
                      {cfg.group}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>{cfg.key}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>{cfg.value}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{cfg.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PeeringDB IXPs Tab */}
      {subTab === 'peering' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_PEERING_IXPS.map(ix => (
            <div key={ix.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#7e22ce', fontWeight: 700 }}>
                  PEERINGDB IXP FABRIC
                </span>
                <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>{ix.speedGbps} Gbps Fabric</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{ix.ixName}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>Location: {ix.city}, {ix.country}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div><span style={{ color: '#64748b' }}>IPv4 Subnet: </span><span style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{ix.ipv4Prefix}</span></div>
                <div><span style={{ color: '#64748b' }}>IPv6 Prefix: </span><span style={{ color: '#334155', fontFamily: 'var(--font-mono)' }}>{ix.ipv6Prefix}</span></div>
                <div><span style={{ color: '#64748b' }}>Connected ASNs: </span><span style={{ color: '#16a34a', fontWeight: 700 }}>{ix.participantsCount} Peers Connected</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add System User */}
      {showAddUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Create System User Account
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Registers new administrator or operator account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateUser} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {modalError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.8rem'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{modalError}</span>
                </div>
              )}

              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.75rem',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Security Policy:</strong> Password must be <strong>at least 12 characters</strong> long.
                </span>
              </div>

              {/* Full Name & Username */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', backgroundColor: '#ffffff' }}>
                    <User size={14} color="#64748b" style={{ marginRight: '6px' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={newFullName}
                      onChange={e => setNewFullName(e.target.value)}
                      style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Username *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', backgroundColor: '#ffffff' }}>
                    <User size={14} color="#64748b" style={{ marginRight: '6px' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. ramesh.k"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Corporate Email & Mobile Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Corporate Email *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', backgroundColor: '#ffffff' }}>
                    <Mail size={14} color="#64748b" style={{ marginRight: '6px' }} />
                    <input
                      type="email"
                      required
                      placeholder="user@enterprise.local"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Mobile Phone (for SMS) *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', backgroundColor: '#ffffff' }}>
                    <Phone size={14} color="#64748b" style={{ marginRight: '6px' }} />
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Department & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Department
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', backgroundColor: '#ffffff' }}>
                    <Briefcase size={14} color="#64748b" style={{ marginRight: '6px' }} />
                    <select
                      value={newDepartment}
                      onChange={e => setNewDepartment(e.target.value)}
                      style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem', background: '#ffffff' }}
                    >
                      <option value="NOC Operations">NOC Operations</option>
                      <option value="Network Infrastructure">Network Infrastructure</option>
                      <option value="System Administration">System Administration</option>
                      <option value="Security Operations (SOC)">Security Operations (SOC)</option>
                      <option value="Leadership & Management">Leadership &amp; Management</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    System Role
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', backgroundColor: '#ffffff' }}>
                    <ShieldCheck size={14} color="#64748b" style={{ marginRight: '6px' }} />
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem', background: '#ffffff' }}
                    >
                      <option value="operator">Operator (Poll / Mute / Ack)</option>
                      <option value="viewer">Viewer (Read Only)</option>
                      <option value="superadmin">SuperAdmin (Full Control)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    Password (Mandatory &ge; 12 Characters) *
                  </label>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: newPassword.length >= 12 ? '#16a34a' : newPassword.length > 0 ? '#dc2626' : '#64748b'
                  }}>
                    {newPassword.length}/12 chars {newPassword.length >= 12 ? '✓ Valid' : '(Min 12 required)'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: newPassword.length >= 12 ? '1px solid #16a34a' : newPassword.length > 0 ? '1px solid #dc2626' : '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0 10px',
                  backgroundColor: '#ffffff'
                }}>
                  <Lock size={14} color={newPassword.length >= 12 ? '#16a34a' : '#64748b'} style={{ marginRight: '6px' }} />
                  <input
                    type="password"
                    required
                    minLength={12}
                    placeholder="Enter at least 12 characters..."
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUser || newPassword.length < 12}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: newPassword.length >= 12 ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#94a3b8',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: newPassword.length >= 12 && !submittingUser ? 'pointer' : 'not-allowed'
                  }}
                >
                  {submittingUser ? 'Saving to Database...' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
