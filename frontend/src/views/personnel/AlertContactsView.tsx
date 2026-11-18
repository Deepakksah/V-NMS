import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  User,
  CheckCircle2,
  AlertTriangle,
  Link2,
  ArrowRight,
  RefreshCw,
  Search,
  ShieldCheck,
  Clock
} from 'lucide-react';
import type { AlertRecipient } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AlertContactsViewProps {
  onNavigateToMatrix?: (recipientId?: number) => void;
  apiBase?: string;
}

export const AlertContactsView: React.FC<AlertContactsViewProps> = ({
  onNavigateToMatrix,
  apiBase = typeof window !== 'undefined' && window.location.port === '5173' 
    ? 'http://127.0.0.1:8081/api/v1' 
    : '/api/v1'
}) => {
  const toast = useToast();
  const [recipients, setRecipients] = useState<AlertRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(true);

  // New Person Form State (Add time ONLY person details!)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('NOC Operations');
  const [role, setRole] = useState('Senior NOC Engineer');
  const [onCallStatus, setOnCallStatus] = useState('active');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchRecipients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/notifications/recipients`);
      if (res.ok) {
        const data = await res.json();
        setRecipients(data.recipients || []);
      }
    } catch (err: any) {
      console.error('Failed to load recipients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill in Full Name, Email, and Phone number.');
      toast.warning('Please fill in Full Name, Email, and Phone number.', 'Validation Required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/notifications/recipients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          department,
          role,
          on_call_status: onCallStatus
        })
      });

      if (res.ok) {
        const data = await res.json();
        const createdId = data.recipient?.id;
        const savedName = fullName.trim();
        setFullName('');
        setEmail('');
        setPhone('');
        toast.success(`Person "${savedName}" added successfully! You can now configure server alert routing.`, 'Person Saved');
        setToastMsg({
          text: `Person "${savedName}" added successfully! You can now configure server alert routing.`,
          type: 'success'
        });
        setTimeout(() => setToastMsg(null), 2000);
        await fetchRecipients();

        // Optionally navigate directly to linking page if requested
        if (createdId && onNavigateToMatrix) {
          // Keep on page with toast or give quick link
        }
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Failed to save person');
        toast.error(errData.error || 'Failed to save person', 'Save Failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error with V-NMS backend');
      toast.error(err.message || 'Connection error with V-NMS backend', 'Network Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePerson = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete alert contact "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${apiBase}/notifications/recipients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.info(`Person "${name}" deleted from alert directory.`, 'Person Removed');
        setToastMsg({ text: `Person "${name}" deleted from alert directory.`, type: 'success' });
        setTimeout(() => setToastMsg(null), 2000);
        fetchRecipients();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete person', 'Error');
    }
  };

  const filteredRecipients = recipients.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q) ||
      (r.department || '').toLowerCase().includes(q) ||
      (r.role || '').toLowerCase().includes(q)
    );
  });

  const activeOnCallCount = recipients.filter(r => r.on_call_status === 'active').length;
  const standbyCount = recipients.filter(r => r.on_call_status === 'standby').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderRadius: '8px',
          background: toastMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${toastMsg.type === 'success' ? '#86efac' : '#fca5a5'}`,
          color: toastMsg.type === 'success' ? '#15803d' : '#991b1b',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{toastMsg.text}</span>
          </div>
          {onNavigateToMatrix && (
            <button
              onClick={() => onNavigateToMatrix()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '6px',
                background: '#15803d',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>Go to Server Linking Matrix</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Page Title & Navigation Banner */}
      <div style={{
        background: '#ffffff',
        padding: '20px 24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7' }}>
              <Users size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Alert Recipients &amp; On-Call Persons Directory
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Dedicated management page to add and maintain on-call contacts. Server and device alert subscriptions are configured on the separate Linking Page.
              </p>
            </div>
          </div>
        </div>

        {/* Action: Jump to Separate Linking Matrix */}
        {onNavigateToMatrix && (
          <button
            onClick={() => onNavigateToMatrix()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
            }}
          >
            <Link2 size={16} />
            <span>Open Device Alert Linking Page</span>
            <ArrowRight size={15} />
          </button>
        )}
      </div>

      {/* Metric Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>TOTAL REGISTERED CONTACTS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{recipients.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px' }}>Enterprise Alert Recipient Directory</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>ACTIVE 24x7 ON-CALL</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{activeOnCallCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Instant SMS &amp; Email Dispatch</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>STANDBY / ESCALATION</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{standbyCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Secondary Tier NOC Roster</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>DELIVERY CHANNELS</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', marginTop: '8px', display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px' }}>SMTP Email</span>
            <span style={{ fontSize: '0.75rem', background: '#f3e8ff', color: '#7e22ce', padding: '3px 8px', borderRadius: '4px' }}>Twilio SMS</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>Per-server configurable</div>
        </div>
      </div>

      {/* FULL FORM: ADD NEW PERSON (ONLY PERSON DETAILS) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} color="#0284c7" />
              <span>Add New Alert Person / Contact</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0 0' }}>
              Enter person identity &amp; contact channels. (No servers/devices to pick here — linking is done on the separate Linking Page).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.76rem',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {showAddForm ? 'Minimize Form' : '+ Expand Add Form'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleCreatePerson} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '6px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.82rem'
              }}>
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Row 1: Full Name, Corporate Email, Mobile Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff' }}>
                  <User size={15} color="#64748b" style={{ marginRight: '8px' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Network Administrator"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Corporate Email (for Email Alerts) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff' }}>
                  <Mail size={15} color="#64748b" style={{ marginRight: '8px' }} />
                  <input
                    type="email"
                    required
                    placeholder="noc-admin@enterprise.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Mobile Phone (for SMS Alerts) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff' }}>
                  <Phone size={15} color="#64748b" style={{ marginRight: '8px' }} />
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Department, Role, On-Call Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Department
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff' }}>
                  <Briefcase size={15} color="#64748b" style={{ marginRight: '8px' }} />
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: '0.85rem', background: '#ffffff' }}
                  >
                    <option value="NOC Operations">NOC Operations</option>
                    <option value="Network Infrastructure">Network Infrastructure</option>
                    <option value="System Administration">System Administration</option>
                    <option value="Security Operations (SOC)">Security Operations (SOC)</option>
                    <option value="Database Engineering">Database Engineering</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Job Role / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. L3 Senior NOC Lead"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  On-Call Schedule Availability
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff' }}>
                  <Clock size={15} color="#64748b" style={{ marginRight: '8px' }} />
                  <select
                    value={onCallStatus}
                    onChange={e => setOnCallStatus(e.target.value)}
                    style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: '0.85rem', background: '#ffffff' }}
                  >
                    <option value="active">Active 24x7 (Instant Alert Dispatch)</option>
                    <option value="business_hours">Business Hours Only (09:00 - 18:00)</option>
                    <option value="standby">Standby (Escalation Backup)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 24px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Saving Contact...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />
                    <span>Save Alert Contact</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* FULL TABLE: REGISTERED PERSONS DIRECTORY */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Registered On-Call Contacts Directory
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0 0' }}>
              Click &quot;Link to Servers&quot; on any person to configure which servers send Email / SMS to them.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search Filter */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', background: '#ffffff', width: '240px' }}>
              <Search size={14} color="#94a3b8" style={{ marginRight: '6px' }} />
              <input
                type="text"
                placeholder="Search persons..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '7px 0', border: 'none', outline: 'none', fontSize: '0.80rem' }}
              />
            </div>

            <button
              onClick={fetchRecipients}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.76rem', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>PERSON NAME &amp; ROLE</th>
                <th style={{ padding: '12px 16px' }}>CORPORATE EMAIL</th>
                <th style={{ padding: '12px 16px' }}>MOBILE PHONE</th>
                <th style={{ padding: '12px 16px' }}>DEPARTMENT</th>
                <th style={{ padding: '12px 16px' }}>ON-CALL STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>SERVER LINKING ACTION</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No alert contacts found. Use the form above to add a person.
                  </td>
                </tr>
              ) : (
                filteredRecipients.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Name & Role */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#e0f2fe',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.90rem'
                        }}>
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{r.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} color="#0284c7" />
                        <span>{r.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="#16a34a" />
                        <span>{r.phone}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td style={{ padding: '12px 16px', fontSize: '0.80rem', color: '#475569' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                        {r.department}
                      </span>
                    </td>

                    {/* On-Call Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        background: r.on_call_status === 'active' ? '#dcfce7' : '#fef3c7',
                        color: r.on_call_status === 'active' ? '#15803d' : '#b45309',
                        border: r.on_call_status === 'active' ? '1px solid #bbf7d0' : '1px solid #fde68a'
                      }}>
                        <ShieldCheck size={12} />
                        <span>{r.on_call_status === 'active' ? 'ACTIVE 24x7' : r.on_call_status.toUpperCase()}</span>
                      </span>
                    </td>

                    {/* Link Action */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {onNavigateToMatrix && (
                        <button
                          onClick={() => onNavigateToMatrix(r.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            background: '#e0f2fe',
                            border: '1px solid #bae6fd',
                            color: '#0369a1',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Link2 size={13} />
                          <span>Link to Servers &rarr;</span>
                        </button>
                      )}
                    </td>

                    {/* Delete */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeletePerson(r.id, r.name)}
                        title="Delete Person"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

