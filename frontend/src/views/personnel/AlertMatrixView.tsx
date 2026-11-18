import React, { useState, useEffect } from 'react';
import {
  Link2,
  UserPlus,
  Mail,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowLeft
} from 'lucide-react';
import type { Device, AlertRecipient } from '../../types';
import { VendorLogo, DeviceTypeBadge } from '../../components/VendorLogo';
import { useToast } from '../../context/ToastContext';

interface AlertMatrixViewProps {
  devices?: Device[];
  initialRecipientId?: number | null;
  onNavigateToContacts?: () => void;
  apiBase?: string;
}

export const AlertMatrixView: React.FC<AlertMatrixViewProps> = ({
  devices = [],
  initialRecipientId = null,
  onNavigateToContacts,
  apiBase = typeof window !== 'undefined' && window.location.port === '5173' 
    ? 'http://127.0.0.1:8081/api/v1' 
    : '/api/v1'
}) => {
  const toast = useToast();
  const [recipients, setRecipients] = useState<AlertRecipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(initialRecipientId);
  const [deviceSubscriptions, setDeviceSubscriptions] = useState<Record<number, { send_email: boolean; send_sms: boolean; alert_types: string }>>({});
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [savingSubscriptions, setSavingSubscriptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch recipients list
  const fetchRecipients = async () => {
    setLoadingRecipients(true);
    try {
      const res = await fetch(`${apiBase}/notifications/recipients`);
      if (res.ok) {
        const data = await res.json();
        const list: AlertRecipient[] = data.recipients || [];
        setRecipients(list);
        if (list.length > 0) {
          setSelectedRecipientId(prev => (prev !== null && list.some(r => r.id === prev)) ? prev : list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load recipients:', err);
    } finally {
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  useEffect(() => {
    if (initialRecipientId !== null) {
      setSelectedRecipientId(initialRecipientId);
    }
  }, [initialRecipientId]);

  // Fetch device subscriptions for selected person
  const fetchSubscriptions = async (recipId: number) => {
    setLoadingSubscriptions(true);
    try {
      const res = await fetch(`${apiBase}/notifications/recipients/${recipId}/subscriptions`);
      if (res.ok) {
        const data = await res.json();
        const map: Record<number, { send_email: boolean; send_sms: boolean; alert_types: string }> = {};
        (data.subscriptions || []).forEach((rule: any) => {
          map[rule.device_id] = {
            send_email: rule.send_email,
            send_sms: rule.send_sms,
            alert_types: rule.alert_types || 'all'
          };
        });
        setDeviceSubscriptions(map);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    if (selectedRecipientId) {
      fetchSubscriptions(selectedRecipientId);
    }
  }, [selectedRecipientId]);

  const handleToggleDeviceEmail = (deviceId: number) => {
    setDeviceSubscriptions(prev => {
      const current = prev[deviceId] || { send_email: false, send_sms: false, alert_types: 'all' };
      return {
        ...prev,
        [deviceId]: { ...current, send_email: !current.send_email }
      };
    });
  };

  const handleToggleDeviceSMS = (deviceId: number) => {
    setDeviceSubscriptions(prev => {
      const current = prev[deviceId] || { send_email: false, send_sms: false, alert_types: 'all' };
      return {
        ...prev,
        [deviceId]: { ...current, send_sms: !current.send_sms }
      };
    });
  };

  const handleToggleDeviceBoth = (deviceId: number) => {
    setDeviceSubscriptions(prev => {
      const current = prev[deviceId] || { send_email: false, send_sms: false, alert_types: 'all' };
      const nextBoth = !(current.send_email && current.send_sms);
      return {
        ...prev,
        [deviceId]: { ...current, send_email: nextBoth, send_sms: nextBoth }
      };
    });
  };

  const handleBulkToggle = (action: 'all_email' | 'all_sms' | 'all_both' | 'clear_all') => {
    setDeviceSubscriptions(prev => {
      const next = { ...prev };
      devices.forEach(d => {
        const cur = next[d.id] || { send_email: false, send_sms: false, alert_types: 'all' };
        if (action === 'all_email') {
          next[d.id] = { ...cur, send_email: true };
        } else if (action === 'all_sms') {
          next[d.id] = { ...cur, send_sms: true };
        } else if (action === 'all_both') {
          next[d.id] = { ...cur, send_email: true, send_sms: true };
        } else if (action === 'clear_all') {
          next[d.id] = { ...cur, send_email: false, send_sms: false };
        }
      });
      return next;
    });
  };

  const handleSaveSubscriptions = async () => {
    if (!selectedRecipientId) return;
    setSavingSubscriptions(true);
    try {
      const subsArray = devices.map(d => {
        const cur = deviceSubscriptions[d.id] || { send_email: false, send_sms: false, alert_types: 'all' };
        return {
          device_id: d.id,
          send_email: cur.send_email,
          send_sms: cur.send_sms,
          alert_types: cur.alert_types || 'all'
        };
      });

      const res = await fetch(`${apiBase}/notifications/recipients/${selectedRecipientId}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptions: subsArray })
      });

      if (res.ok) {
        const selName = recipients.find(r => r.id === selectedRecipientId)?.name || 'contact';
        toast.success(`Saved alert delivery routing rules for "${selName}" across ${devices.length} servers!`, 'Matrix Saved');
        setToastMsg({
          text: `Saved alert delivery routing rules for ${selName} across ${devices.length} devices!`,
          type: 'success'
        });
        setTimeout(() => setToastMsg(null), 2000);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to save rules', 'Save Failed');
      setToastMsg({ text: e.message || 'Failed to save rules', type: 'error' });
    } finally {
      setSavingSubscriptions(false);
    }
  };

  const currentRecipient = recipients.find(r => r.id === selectedRecipientId);

  const filteredDevices = devices.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      (d.hostname || '').toLowerCase().includes(q) ||
      (d.ip_address || '').toLowerCase().includes(q) ||
      (d.vendor || '').toLowerCase().includes(q) ||
      (d.device_type || '').toLowerCase().includes(q)
    );
  });

  // Calculate live counts for selected recipient
  let emailCount = 0;
  let smsCount = 0;
  let bothCount = 0;
  devices.forEach(d => {
    const sub = deviceSubscriptions[d.id];
    if (sub?.send_email && sub?.send_sms) bothCount++;
    if (sub?.send_email) emailCount++;
    if (sub?.send_sms) smsCount++;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
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

      {/* Page Title & Back to Persons Action */}
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
            <div style={{ padding: '8px', borderRadius: '8px', background: '#dcfce7', color: '#15803d' }}>
              <Link2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Device Alert Notification Linking Matrix
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Dedicated page to link registered persons with monitored servers &amp; devices via Email and SMS checkboxes.
              </p>
            </div>
          </div>
        </div>

        {onNavigateToContacts && (
          <button
            onClick={onNavigateToContacts}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} />
            <span>&larr; Manage Persons / Add New Person</span>
          </button>
        )}
      </div>

      {/* PERSON SELECTOR BAR (PICK WHICH PERSON TO CONFIGURE) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '20px 24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
              Select Alert Person:
            </label>
            <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
              <select
                value={selectedRecipientId ?? ''}
                onChange={e => setSelectedRecipientId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '2px solid #0284c7',
                  background: '#f0f9ff',
                  color: '#0369a1',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {recipients.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} — ({r.email} | {r.phone}) [{r.department}]
                  </option>
                ))}
              </select>
            </div>
            {(loadingSubscriptions || loadingRecipients) && <RefreshCw size={15} className="spin" color="#0284c7" />}
          </div>

          {/* Quick Add Person Link */}
          {onNavigateToContacts && (
            <button
              onClick={onNavigateToContacts}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                color: '#0284c7',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <UserPlus size={14} />
              <span>+ Add Another Person</span>
            </button>
          )}
        </div>

        {/* Selected Person Details Banner */}
        {currentRecipient && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>
                {currentRecipient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{currentRecipient.name}</span>
                  <span style={{ fontSize: '0.70rem', padding: '1px 6px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontWeight: 700 }}>
                    {currentRecipient.department} • {currentRecipient.role}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                  <span><strong style={{ color: '#334155' }}>Email:</strong> {currentRecipient.email}</span>
                  <span><strong style={{ color: '#334155' }}>SMS:</strong> {currentRecipient.phone}</span>
                </div>
              </div>
            </div>

            {/* Current Active Counts */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ padding: '6px 12px', borderRadius: '6px', background: '#f0f9ff', border: '1px solid #bae6fd', textAlign: 'center' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0284c7' }}>{emailCount}</div>
                <div style={{ fontSize: '0.64rem', color: '#0369a1', fontWeight: 700 }}>EMAIL SERVERS</div>
              </div>
              <div style={{ padding: '6px 12px', borderRadius: '6px', background: '#f5f3ff', border: '1px solid #ddd6fe', textAlign: 'center' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#7c3aed' }}>{smsCount}</div>
                <div style={{ fontSize: '0.64rem', color: '#6d28d9', fontWeight: 700 }}>SMS SERVERS</div>
              </div>
              <div style={{ padding: '6px 12px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#16a34a' }}>{bothCount}</div>
                <div style={{ fontSize: '0.64rem', color: '#15803d', fontWeight: 700 }}>BOTH (EMAIL+SMS)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FULL MATRIX: DEVICES & SERVERS WITH EMAIL / SMS CHECKBOXES */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Controls: Search and Bulk Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff', width: '320px' }}>
            <Search size={15} color="#94a3b8" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search servers, switches, IPs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.84rem' }}
            />
          </div>

          {/* Quick Bulk Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Bulk Actions:</span>
            <button
              type="button"
              onClick={() => handleBulkToggle('all_both')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #86efac',
                background: '#f0fdf4',
                color: '#15803d',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✓ All Both (Email+SMS)
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggle('all_email')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #bae6fd',
                background: '#f0f9ff',
                color: '#0369a1',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✓ All Email Only
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggle('all_sms')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd6fe',
                background: '#f5f3ff',
                color: '#6d28d9',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✓ All SMS Only
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggle('clear_all')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ maxHeight: '540px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc' }}>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                  <th style={{ padding: '6px 10px' }}>MONITORED SERVER / HOST</th>
                  <th style={{ padding: '6px 10px', width: '130px', textAlign: 'center' }}>EMAIL DISPATCH</th>
                  <th style={{ padding: '6px 10px', width: '130px', textAlign: 'center' }}>SMS DISPATCH</th>
                  <th style={{ padding: '6px 10px', width: '110px', textAlign: 'center' }}>QUICK TOGGLE</th>
                  <th style={{ padding: '6px 10px', width: '170px', textAlign: 'center' }}>ACTIVE CHANNELS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map(d => {
                  const sub = deviceSubscriptions[d.id] || { send_email: false, send_sms: false, alert_types: 'all' };
                  const isBoth = sub.send_email && sub.send_sms;
                  const isEmailOnly = sub.send_email && !sub.send_sms;
                  const isSmsOnly = !sub.send_email && sub.send_sms;
                  const isNone = !sub.send_email && !sub.send_sms;

                  return (
                    <tr
                      key={d.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isBoth ? 'rgba(34, 197, 94, 0.04)' : 'transparent'
                      }}
                    >
                      {/* Server & IP Details */}
                      <td style={{ padding: '4px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {d.vendor && <VendorLogo vendor={d.vendor} size="xs" showLabel={false} />}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.76rem' }}>
                                {d.hostname}
                              </span>
                              {d.device_type && <DeviceTypeBadge type={d.device_type} size="xs" />}
                            </div>
                            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                              {d.ip_address} • {d.hardware || d.vendor || 'Compute Node'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email Checkbox */}
                      <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.74rem', color: sub.send_email ? '#0284c7' : '#64748b', fontWeight: sub.send_email ? 700 : 500 }}>
                          <input
                            type="checkbox"
                            checked={sub.send_email}
                            onChange={() => handleToggleDeviceEmail(d.id)}
                            style={{ accentColor: '#0284c7', width: '13px', height: '13px', cursor: 'pointer' }}
                          />
                          <span>Email</span>
                        </label>
                      </td>

                      {/* SMS Checkbox */}
                      <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.74rem', color: sub.send_sms ? '#7c3aed' : '#64748b', fontWeight: sub.send_sms ? 700 : 500 }}>
                          <input
                            type="checkbox"
                            checked={sub.send_sms}
                            onChange={() => handleToggleDeviceSMS(d.id)}
                            style={{ accentColor: '#7c3aed', width: '13px', height: '13px', cursor: 'pointer' }}
                          />
                          <span>SMS</span>
                        </label>
                      </td>

                      {/* Quick Toggle Button */}
                      <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleDeviceBoth(d.id)}
                          style={{
                            padding: '2px 7px',
                            borderRadius: '4px',
                            border: isBoth ? '1px solid #16a34a' : '1px solid #cbd5e1',
                            background: isBoth ? '#dcfce7' : '#ffffff',
                            color: isBoth ? '#15803d' : '#475569',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {isBoth ? '✓ Both On' : 'Both'}
                        </button>
                      </td>

                      {/* Active Channels Badge */}
                      <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                        {isBoth && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#dcfce7',
                            color: '#15803d',
                            fontSize: '0.67rem',
                            fontWeight: 700,
                            border: '1px solid #86efac'
                          }}>
                            <Mail size={11} /> + <Smartphone size={11} /> Both Active
                          </span>
                        )}
                        {isEmailOnly && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            fontSize: '0.67rem',
                            fontWeight: 700,
                            border: '1px solid #bae6fd'
                          }}>
                            <Mail size={11} /> Email Only
                          </span>
                        )}
                        {isSmsOnly && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#f3e8ff',
                            color: '#7e22ce',
                            fontSize: '0.67rem',
                            fontWeight: 700,
                            border: '1px solid #ddd6fe'
                          }}>
                            <Smartphone size={11} /> SMS Only
                          </span>
                        )}
                        {isNone && (
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: '#94a3b8',
                            fontSize: '0.72rem',
                            fontWeight: 600
                          }}>
                            No Alerts (Muted)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Sticky Save Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.82rem', color: '#475569' }}>
            Linking rules for <strong>{currentRecipient?.name || 'Selected Contact'}</strong> across <strong>{filteredDevices.length}</strong> monitored servers.
          </div>

          <button
            type="button"
            disabled={savingSubscriptions || !selectedRecipientId}
            onClick={handleSaveSubscriptions}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: savingSubscriptions ? 'not-allowed' : 'pointer',
              boxShadow: '0 3px 8px rgba(22, 163, 74, 0.35)'
            }}
          >
            {savingSubscriptions ? (
              <>
                <RefreshCw size={15} className="spin" />
                <span>Saving Matrix Rules...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                <span>Save Device Alert Linking Matrix</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
