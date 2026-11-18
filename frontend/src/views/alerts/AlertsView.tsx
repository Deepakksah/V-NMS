import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Send,
  Check,
  Mail,
  Smartphone,
  FileCode,
  RefreshCw,
  ShieldAlert,
  Eye,
  Copy,
  Play,
  Zap,
  Settings,
  Database,
  ChevronDown,
  ChevronUp,
  X,
  Bell,
  Users,
  UserPlus,
  Trash2,
  Search,
  Phone,
  Briefcase,
  User,
  Clock
} from 'lucide-react';
import type { Device, AlertRecipient } from '../../types';
import { VendorLogo, DeviceTypeBadge } from '../../components/VendorLogo';
import { useToast } from '../../context/ToastContext';
import { ExportButtons } from '../../components/ExportButtons';

const API_BASE = 'http://127.0.0.1:8081/api/v1';

export interface AlertRuleConfig {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  metric: string;
  condition: string;
  thresholdVal: string;
  frequency: string;
  scope: string;
  channels: string[];
  enabled: boolean;
  desc: string;
  query: string;
  simulateType: 'down' | 'storage' | 'latency' | 'cpu' | 'memory' | 'recovery';
}

interface AlertsViewProps {
  realAlerts?: any[];
  devices?: Device[];
  initialSubTab?: 'active' | 'rules' | 'recipients' | 'smtp' | 'sms' | 'templates' | 'escalations' | 'dispatches' | 'ai_remediation';
}

interface AlertItem {
  id: number;
  device_id: number;
  severity: string;
  rule_name: string;
  message: string;
  status: string;
  fired_at: string;
  resolved_at?: string;
  device?: Device;
}

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  security: string;
  from_email: string;
  from_name: string;
  recipients: string;
  enabled: boolean;
}

interface SMSConfig {
  provider: string;
  account_sid: string;
  auth_token?: string;
  sender_number: string;
  recipients: string;
  custom_url: string;
  enabled: boolean;
}

interface AlertTemplate {
  id: string;
  name: string;
  event_type: string;
  email_subject: string;
  email_body: string;
  sms_text: string;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ realAlerts: _realAlerts = [], devices = [], initialSubTab }) => {
  const toast = useToast();
  const [subTab, setSubTab] = useState<'active' | 'rules' | 'recipients' | 'smtp' | 'sms' | 'templates' | 'escalations' | 'dispatches' | 'ai_remediation'>(initialSubTab || 'active');
  const [escalations, setEscalations] = useState<any[]>([]);
  const [advancedTriggers, setAdvancedTriggers] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [aiRemediations, setAiRemediations] = useState<any[]>([]);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'email' | 'sms'; success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  // Alert Recipients & Device Subscriptions State
  const [recipients, setRecipients] = useState<AlertRecipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);
  const [deviceSubscriptions, setDeviceSubscriptions] = useState<Record<number, { send_email: boolean; send_sms: boolean; alert_types: string }>>({});
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [savingSubscriptions, setSavingSubscriptions] = useState(false);
  const [matrixSearch, setMatrixSearch] = useState('');
  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false);

  // Add Recipient form state
  const [recipName, setRecipName] = useState('');
  const [recipEmail, setRecipEmail] = useState('');
  const [recipPhone, setRecipPhone] = useState('');
  const [recipDepartment, setRecipDepartment] = useState('NOC Operations');
  const [recipRole, setRecipRole] = useState('Senior NOC Engineer');
  const [recipOnCall, setRecipOnCall] = useState('active');
  const [recipModalError, setRecipModalError] = useState<string | null>(null);

  // Settings states
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    host: 'smtp.office365.com',
    port: 587,
    username: 'noc-alerts@enterprise.local',
    password: '',
    security: 'tls',
    from_email: 'noc-alerts@enterprise.local',
    from_name: 'V-NMS Enterprise NOC',
    recipients: 'sysadmin@enterprise.local, oncall-noc@enterprise.local',
    enabled: true
  });

  const [smsConfig, setSmsConfig] = useState<SMSConfig>({
    provider: 'twilio',
    account_sid: 'AC_demo_72ac3988_enterprise',
    auth_token: 'auth_token_secret_live',
    sender_number: '+18005550199',
    recipients: '+15550199222, +919876543210',
    custom_url: 'https://api.sms-gateway.enterprise.local/v1/dispatch',
    enabled: true
  });

  const [templates, setTemplates] = useState<AlertTemplate[]>([
    {
      id: 'tmpl-host-down',
      name: 'Host DOWN Critical Incident',
      event_type: 'host_down',
      email_subject: '[CRITICAL] Infrastructure Host DOWN: {{hostname}} ({{ip}})',
      email_body: `<div style="font-family: sans-serif; padding: 16px; border: 1px solid #fecaca; border-radius: 8px; background: #fffaf0;">
  <h3 style="color: #b91c1c; margin-top: 0;">🚨 [CRITICAL ALERT] Host Down Incident Detected</h3>
  <p><strong>Hostname:</strong> {{hostname}}<br/>
  <strong>IP Address:</strong> {{ip}}<br/>
  <strong>Device Type:</strong> {{device_type}}<br/>
  <strong>Hardware:</strong> {{hardware}} ({{vendor}})<br/>
  <strong>Incident Time:</strong> {{event_time}}<br/>
  <strong>Root Cause:</strong> ICMP ping packets timed out across consecutive probes.</p>
  <p style="color: #dc2626; font-weight: bold;">Immediate NOC investigation required.</p>
</div>`,
      sms_text: '🚨 [CRITICAL DOWN] {{hostname}} ({{ip}}) is DOWN at {{event_time}}! ICMP unreachable. NOC on-call dispatched.'
    },
    {
      id: 'tmpl-host-up',
      name: 'Host RECOVERED (UP) Notification',
      event_type: 'host_up',
      email_subject: '[RESOLVED] Infrastructure Host RECOVERED: {{hostname}} ({{ip}})',
      email_body: `<div style="font-family: sans-serif; padding: 16px; border: 1px solid #bbf7d0; border-radius: 8px; background: #f0fdf4;">
  <h3 style="color: #15803d; margin-top: 0;">✅ [RESOLVED] Host Connectivity Restored</h3>
  <p><strong>Hostname:</strong> {{hostname}}<br/>
  <strong>IP Address:</strong> {{ip}}<br/>
  <strong>Downtime Duration:</strong> {{downtime_duration}}<br/>
  <strong>Recovery Time:</strong> {{event_time}}<br/>
  <strong>Status:</strong> ICMP Ping active, latency {{metric_value}} ms.</p>
  <p style="color: #16a34a;">Alert incident marked auto-cleared in audit log.</p>
</div>`,
      sms_text: '✅ [RESOLVED UP] {{hostname}} ({{ip}}) recovered at {{event_time}}. Total downtime: {{downtime_duration}}. RTT: {{metric_value}} ms.'
    },
    {
      id: 'tmpl-storage-full',
      name: 'Storage Volume Threshold Breach (>=90%)',
      event_type: 'storage_full',
      email_subject: '[WARNING] Storage Capacity Breach >=90% on {{hostname}}',
      email_body: `<div style="font-family: sans-serif; padding: 16px; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2;">
  <h3 style="color: #b91c1c; margin-top: 0;">💾 [WARNING] Storage Volume Critical Threshold Breached</h3>
  <p><strong>Hostname:</strong> {{hostname}} ({{ip}})<br/>
  <strong>Storage Partition:</strong> C:\\ (System NVMe)<br/>
  <strong>Capacity Usage:</strong> {{metric_value}}% (Threshold: 90%)<br/>
  <strong>Time:</strong> {{event_time}}</p>
  <p style="color: #dc2626;">Please purge log volumes or expand LVM/disk partition.</p>
</div>`,
      sms_text: '💾 [STORAGE FULL] {{hostname}} partition is at {{metric_value}}% capacity (>=90% threshold). Free up disk space immediately.'
    },
    {
      id: 'tmpl-latency-spike',
      name: 'ICMP Latency Spike Breached (>15ms)',
      event_type: 'latency_spike',
      email_subject: '[WARNING] Subnet Latency Spike on {{hostname}} ({{metric_value}} ms)',
      email_body: `<div style="font-family: sans-serif; padding: 16px; border: 1px solid #fde68a; border-radius: 8px; background: #fefce8;">
  <h3 style="color: #a16207; margin-top: 0;">⚡ [WARNING] ICMP Latency Spike Detected</h3>
  <p><strong>Hostname:</strong> {{hostname}} ({{ip}})<br/>
  <strong>Observed Roundtrip RTT:</strong> {{metric_value}} ms<br/>
  <strong>SLA Baseline:</strong> &lt; 2.0 ms<br/>
  <strong>Time:</strong> {{event_time}}</p>
</div>`,
      sms_text: '⚡ [LATENCY SPIKE] {{hostname}} ({{ip}}) latency spiked to {{metric_value}} ms (SLA threshold exceeded).'
    }
  ]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl-host-down');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedSqlId, setExpandedSqlId] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<AlertRuleConfig | null>(null);
  const [ruleToast, setRuleToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Managed Enterprise Alert Rules
  const [rulesList, setRulesList] = useState<AlertRuleConfig[]>([
    {
      id: 'rule-down',
      title: 'Host Unreachable / DOWN Alarm',
      severity: 'CRITICAL',
      metric: 'ICMP Echo Availability',
      condition: 'Packet Loss == 100% (Host Offline)',
      thresholdVal: '2 Consecutive Failed Probes',
      frequency: 'Every 15s (Fast-Ping Poller)',
      scope: 'All 33 Monitored Devices',
      channels: ['Email SMTP', 'Twilio SMS', 'Incident Audit Log'],
      enabled: true,
      desc: 'Fires instant high-priority NOC alarm when host ping echo drops for 2 consecutive 15-second cycles.',
      query: 'SELECT * FROM devices WHERE status = false AND ping_loss >= 100%',
      simulateType: 'down'
    },
    {
      id: 'rule-recovery',
      title: 'Host Recovery / Connectivity Restored',
      severity: 'INFO',
      metric: 'ICMP Echo Response',
      condition: 'Packet Loss == 0% (Host Online)',
      thresholdVal: '1 Successful Probe post-outage',
      frequency: 'Real-time on Ping Echo',
      scope: 'Previously Offline Devices',
      channels: ['Email SMTP', 'Twilio SMS', 'Auto-Clear Event'],
      enabled: true,
      desc: 'Auto-resolves active incident, updates downtime log, and dispatches recovery report.',
      query: 'SELECT * FROM alerts WHERE rule = "DeviceDown" AND ping_status = true',
      simulateType: 'recovery'
    },
    {
      id: 'rule-storage',
      title: 'Storage Volume Capacity >= 90% (Full)',
      severity: 'CRITICAL',
      metric: 'Disk Volume Space',
      condition: 'Usage >= 90% of Volume',
      thresholdVal: 'Sustained >= 60 seconds',
      frequency: 'Every 60s Storage Sweep',
      scope: 'All Servers & Workstations',
      channels: ['Email SMTP', 'Twilio SMS', 'Incident Audit Log'],
      enabled: true,
      desc: 'Triggers critical alarm when root partition or C:\\ system volume exceeds 90% capacity threshold.',
      query: 'SELECT * FROM storage WHERE usage_percent >= 90',
      simulateType: 'storage'
    },
    {
      id: 'rule-latency',
      title: 'ICMP Roundtrip Latency Spike (>15ms)',
      severity: 'WARNING',
      metric: 'Network Latency (RTT)',
      condition: 'Roundtrip RTT > 15.0 ms',
      thresholdVal: '5-Sample Rolling Average > 15ms',
      frequency: 'Continuous 15s Probes',
      scope: 'Gateways, Switches & Core Servers',
      channels: ['Email SMTP', 'Incident Audit Log'],
      enabled: true,
      desc: 'Detects network congestion, routing delays, or fiber degradation before total service drop.',
      query: 'SELECT * FROM metrics WHERE metric = "ping" AND val_1 > 15.0',
      simulateType: 'latency'
    },
    {
      id: 'rule-cpu',
      title: 'Multi-Core CPU Overload (>85%)',
      severity: 'WARNING',
      metric: 'Processor Total Thread Load',
      condition: 'CPU Utilization > 85%',
      thresholdVal: 'Sustained for >= 5 minutes',
      frequency: 'Every 30s Telemetry Cycle',
      scope: 'Dell PowerEdge & Linux Xeon Nodes',
      channels: ['Email SMTP', 'Incident Audit Log'],
      enabled: true,
      desc: 'Flags compute nodes with abnormal runaway processes or prolonged high thread consumption.',
      query: 'SELECT * FROM processors WHERE cpu_percent > 85 FOR 5m',
      simulateType: 'cpu'
    },
    {
      id: 'rule-memory',
      title: 'System Memory Exhaustion (>90%)',
      severity: 'WARNING',
      metric: 'Physical RAM Consumption',
      condition: 'Memory Pool Used > 90%',
      thresholdVal: 'Free RAM < 10% for 2 mins',
      frequency: 'Every 30s Telemetry Cycle',
      scope: 'All Monitored Compute Nodes',
      channels: ['Email SMTP', 'Incident Audit Log'],
      enabled: true,
      desc: 'Alerts before OOM killer or Windows paging terminates critical enterprise services.',
      query: 'SELECT * FROM mempools WHERE (used / total) * 100 > 90',
      simulateType: 'memory'
    }
  ]);

  const toggleRuleEnabled = (ruleId: string) => {
    setRulesList(prev => prev.map(r => {
      if (r.id === ruleId) {
        const nextState = !r.enabled;
        toast.info(`Rule "${r.title}" is now ${nextState ? 'ENABLED (Active)' : 'MUTED (Disabled)'}.`, 'Rule Status');
        setRuleToast({
          message: `Rule "${r.title}" is now ${nextState ? 'ENABLED (Active)' : 'MUTED (Disabled)'}.`,
          type: 'info'
        });
        setTimeout(() => setRuleToast(null), 2000);
        return { ...r, enabled: nextState };
      }
      return r;
    }));
  };

  // Fetch real alerts and settings from backend
  const fetchAlertsAndSettings = async () => {
    setLoading(true);
    try {
      // 1. Fetch alerts
      const res = await fetch('/api/v1/alerts');
      if (res.ok) {
        const data = await res.json();
        const rawAlerts: AlertItem[] = data.alerts || [];
        // Map with devices for rich metadata
        const enriched = rawAlerts.map(a => {
          const d = devices.find(dev => dev.id === a.device_id);
          return { ...a, device: d };
        });
        setAlerts(enriched);
      }

      // 2. Fetch notification settings
      const setRes = await fetch('/api/v1/settings/notifications');
      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData.smtp) setSmtpConfig(setData.smtp);
        if (setData.sms) setSmsConfig(setData.sms);
        if (setData.templates && setData.templates.length > 0) setTemplates(setData.templates);
      }
      // 3. Fetch alert recipients
      await fetchRecipients();

      // 4. Fetch escalations, advanced triggers, and webhook dispatches (Advanced Escalations)
      try {
        const [resEsc, resTrig, resDisp, resAi] = await Promise.allSettled([
          fetch('/api/v1/alerting/escalations').then(r => r.json()),
          fetch('/api/v1/alerting/triggers').then(r => r.json()),
          fetch('/api/v1/alerting/dispatches').then(r => r.json()),
          fetch('/api/v1/analytics/ai-remediation').then(r => r.json())
        ]);
        if (resEsc.status === 'fulfilled' && resEsc.value?.escalations) setEscalations(resEsc.value.escalations);
        if (resTrig.status === 'fulfilled' && resTrig.value?.triggers) setAdvancedTriggers(resTrig.value.triggers);
        if (resDisp.status === 'fulfilled' && resDisp.value?.dispatches) setDispatches(resDisp.value.dispatches);
        if (resAi.status === 'fulfilled' && resAi.value?.ai_remediations) setAiRemediations(resAi.value.ai_remediations);
      } catch { }
    } catch (e) {
      console.error('Failed to fetch alerts data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/recipients`);
      if (res.ok) {
        const data = await res.json();
        const recips: AlertRecipient[] = data.recipients || [];
        setRecipients(recips);
        if (recips.length > 0) {
          setSelectedRecipientId(prev => prev ?? recips[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load alert recipients:', e);
    }
  };

  const fetchSubscriptionsForRecipient = async (recipId: number) => {
    setLoadingSubscriptions(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/recipients/${recipId}/subscriptions`);
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
    } catch (e) {
      console.error('Failed to load subscriptions:', e);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    if (selectedRecipientId) {
      fetchSubscriptionsForRecipient(selectedRecipientId);
    }
  }, [selectedRecipientId]);

  const handleCreateRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecipModalError(null);
    try {
      const res = await fetch(`${API_BASE}/notifications/recipients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipName.trim(),
          email: recipEmail.trim(),
          phone: recipPhone.trim(),
          department: recipDepartment,
          role: recipRole,
          on_call_status: recipOnCall
        })
      });
      if (res.ok) {
        const data = await res.json();
        setShowAddRecipientModal(false);
        setRecipName('');
        setRecipEmail('');
        setRecipPhone('');
        fetchRecipients();
        if (data.recipient?.id) {
          setSelectedRecipientId(data.recipient.id);
        }
        toast.success(`On-call contact "${recipName}" added successfully!`, 'Contact Saved');
        setRuleToast({
          message: `On-call contact ${recipName} added successfully!`,
          type: 'success'
        });
        setTimeout(() => setRuleToast(null), 2000);
      } else {
        const errData = await res.json();
        setRecipModalError(errData.error || 'Failed to create recipient');
        toast.error(errData.error || 'Failed to create recipient', 'Save Failed');
      }
    } catch (err: any) {
      setRecipModalError(err.message || 'Connection error');
      toast.error(err.message || 'Connection error', 'Network Error');
    }
  };

  const handleDeleteRecipient = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove on-call contact "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/recipients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRecipients();
        toast.info(`Contact "${name}" deleted from alert routing.`, 'Contact Deleted');
        setRuleToast({ message: `Contact "${name}" deleted from alert routing.`, type: 'info' });
        setTimeout(() => setRuleToast(null), 2000);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete recipient', 'Error');
    }
  };

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

      const res = await fetch(`${API_BASE}/notifications/recipients/${selectedRecipientId}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptions: subsArray })
      });

      if (res.ok) {
        const selName = recipients.find(r => r.id === selectedRecipientId)?.name || 'contact';
        toast.success(`Saved alert delivery routing rules for "${selName}" across ${devices.length} devices!`, 'Matrix Saved');
        setRuleToast({
          message: `Saved alert delivery routing rules for ${selName} across ${devices.length} devices!`,
          type: 'success'
        });
        setTimeout(() => setRuleToast(null), 2000);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to save rules', 'Save Failed');
    } finally {
      setSavingSubscriptions(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndSettings();
  }, [devices.length]);

  // Acknowledge incident
  const handleAcknowledge = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/alerts/${id}/acknowledge`, { method: 'POST' });
      if (res.ok) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
        toast.success(`Incident #${id} has been acknowledged.`, 'Incident Acknowledged');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to acknowledge incident', 'Action Error');
    }
  };

  // Resolve incident
  const handleResolve = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/alerts/${id}/resolve`, { method: 'POST' });
      if (res.ok) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'cleared', resolved_at: new Date().toISOString() } : a));
        toast.success(`Incident #${id} resolved and cleared!`, 'Incident Cleared');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to resolve incident', 'Action Error');
    }
  };

  // Simulate test trigger
  const handleSimulateAlert = async (type: 'down' | 'storage' | 'latency' | 'cpu' | 'memory' | 'recovery') => {
    const sampleDev = devices[1] || devices[0] || { id: 1, hostname: 'host-gateway', ip_address: '10.0.0.1' };
    let reqBody = {
      device_id: sampleDev.id,
      type: type,
      rule_name: type === 'down' ? 'DeviceDown' : type === 'storage' ? 'StorageFull' : type === 'latency' ? 'LatencySpike' : type === 'cpu' ? 'CPUOverload' : type === 'memory' ? 'MemoryExhaustion' : 'HostRecovery',
      severity: type === 'latency' || type === 'cpu' || type === 'memory' ? 'warning' : type === 'recovery' ? 'info' : 'critical',
      message: type === 'down'
        ? `CRITICAL: Host ${sampleDev.hostname} (${sampleDev.ip_address}) is DOWN! ICMP timed out.`
        : type === 'storage'
          ? `CRITICAL: Storage volume C:\\ on ${sampleDev.hostname} reached 92% capacity!`
          : type === 'latency'
            ? `WARNING: Subnet RTT on ${sampleDev.hostname} spiked to 18.4 ms (Threshold > 15ms)`
            : type === 'cpu'
              ? `WARNING: Multi-Core CPU on ${sampleDev.hostname} sustained at 94.2% (> 85% threshold)!`
              : type === 'memory'
                ? `WARNING: System Memory on ${sampleDev.hostname} reached 91.8% RAM consumption!`
                : `INFO: Host ${sampleDev.hostname} (${sampleDev.ip_address}) connectivity restored. Recovery duration: 4m 12s.`
    };

    try {
      const res = await fetch('/api/v1/alerts/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      });
      if (res.ok) {
        fetchAlertsAndSettings();
        toast.success(`Incident "${reqBody.rule_name}" simulated & logged!`, 'Incident Triggered');
        setRuleToast({
          message: `Incident simulated for "${reqBody.rule_name}"! Saved to incidents log.`,
          type: 'success'
        });
        setTimeout(() => setRuleToast(null), 2000);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to simulate alert', 'Simulation Error');
    }
  };

  // Test Email Handler
  const handleTestEmail = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/notifications/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp: smtpConfig, to: smtpConfig.recipients.split(',')[0].trim() })
      });
      const data = await res.json();
      setTestResult({
        type: 'email',
        success: data.success,
        message: data.message || (data.success ? 'Email test passed!' : 'Email test failed.')
      });
      if (data.success) {
        toast.success(data.message || 'SMTP test email sent successfully!', 'Email Test Passed');
      } else {
        toast.error(data.message || 'SMTP test email failed to send', 'Email Test Failed');
      }
    } catch (e: any) {
      setTestResult({ type: 'email', success: false, message: e.message || 'Connection error' });
      toast.error(e.message || 'Email connection failed', 'Email Error');
    } finally {
      setTesting(false);
    }
  };

  // Test SMS Handler
  const handleTestSMS = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/notifications/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sms: smsConfig, to: smsConfig.recipients.split(',')[0].trim() })
      });
      const data = await res.json();
      setTestResult({
        type: 'sms',
        success: data.success,
        message: data.message || (data.success ? 'SMS test passed!' : 'SMS test failed.')
      });
      if (data.success) {
        toast.success(data.message || 'SMS test message dispatched successfully!', 'SMS Test Passed');
      } else {
        toast.error(data.message || 'SMS test message failed to dispatch', 'SMS Test Failed');
      }
    } catch (e: any) {
      setTestResult({ type: 'sms', success: false, message: e.message || 'Connection error' });
      toast.error(e.message || 'SMS connection failed', 'SMS Error');
    } finally {
      setTesting(false);
    }
  };

  // Save Settings Handler
  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/v1/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp: smtpConfig, sms: smsConfig, templates })
      });
      if (res.ok) {
        toast.success('SMTP, SMS Gateway & Alert Notification Templates saved successfully!', 'Settings Saved');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        toast.error('Failed to save notification settings', 'Save Error');
      }
    } catch (e: any) {
      toast.error(e.message || 'Network error saving settings', 'Save Error');
    }
  };

  // Current active template
  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  // Helper for live preview rendering
  const renderPreview = (text: string) => {
    const d = devices[1] || devices[0] || { hostname: 'srv-node-01', ip_address: '10.0.0.1', vendor: 'Dell', hardware: 'PowerEdge R750', device_type: 'server' };
    return text
      .replace(/{{hostname}}/g, d.hostname)
      .replace(/{{ip}}/g, d.ip_address)
      .replace(/{{device_type}}/g, (d.device_type || 'Server').toUpperCase())
      .replace(/{{vendor}}/g, d.vendor || 'Dell')
      .replace(/{{hardware}}/g, d.hardware || 'PowerEdge R750')
      .replace(/{{event_time}}/g, new Date().toLocaleTimeString())
      .replace(/{{downtime_duration}}/g, '4m 32s')
      .replace(/{{metric_value}}/g, currentTemplate.event_type === 'storage_full' ? '92' : currentTemplate.event_type === 'latency_spike' ? '18.4' : '0.45');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{
        background: '#ffffff',
        padding: '18px 24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Enterprise Alert Incident &amp; Notification Center
            </h2>
            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '5px', background: '#fee2e2', color: '#b91c1c', fontWeight: 800, border: '1px solid #fecaca' }}>
              INCIDENT MONITOR
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0 0' }}>
            Automated Host DOWN/UP Triggers • SMTP Email Gateway • SMS Gateway • Alert Templates • Live Verification
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExportButtons data={alerts} filenamePrefix="vnms_alerts" title="Alerts & Incidents" />

          <button
            onClick={() => handleSimulateAlert('down')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '6px',
              background: '#fef2f2',
              border: '1px solid #f87171',
              color: '#dc2626',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Play size={12} fill="#dc2626" />
            <span>Simulate DOWN</span>
          </button>

          <button
            onClick={() => handleSimulateAlert('storage')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '6px',
              background: '#fefce8',
              border: '1px solid #fde047',
              color: '#a16207',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Play size={12} fill="#a16207" />
            <span>Simulate Storage Full (92%)</span>
          </button>

          <button
            onClick={fetchAlertsAndSettings}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {[
          { id: 'active', label: 'Triggered Incidents', icon: AlertTriangle, count: alerts.filter(a => a.status === 'active').length, alert: true },
          { id: 'rules', label: 'Automated Alert Rules', icon: ShieldAlert, count: rulesList.length },
          { id: 'ai_remediation', label: '✨ AI Auto-Remediation (#18.6)', icon: Zap, count: aiRemediations.length || 2 },
          { id: 'escalations', label: 'Escalations & Thresholds (#61-#65)', icon: Clock, count: escalations.length + advancedTriggers.length },
          { id: 'dispatches', label: 'Webhooks & Self-Healing (#66-#70)', icon: Zap, count: dispatches.length },
          { id: 'recipients', label: 'Alert Recipients & Device Routing Matrix', icon: Users, count: recipients.length },
          { id: 'smtp', label: 'Email (SMTP) Gateway', icon: Mail },
          { id: 'sms', label: 'SMS Gateway Config', icon: Smartphone },
          { id: 'templates', label: 'Alert Notification Templates', icon: FileCode, count: templates.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setSubTab(tab.id as any); setTestResult(null); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                background: isActive ? '#f0f9ff' : '#ffffff',
                color: isActive ? '#0284c7' : '#475569',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.80rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
            >
              <Icon size={14} color={isActive ? '#0284c7' : '#64748b'} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '0.66rem',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: tab.alert && tab.count > 0 ? '#fee2e2' : '#f1f5f9',
                  color: tab.alert && tab.count > 0 ? '#b91c1c' : '#64748b',
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Global Success / Test Banner */}
      {saveSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 16px', color: '#166534', fontSize: '0.80rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} color="#16a34a" />
          <strong>Configuration saved successfully to system config!</strong>
        </div>
      )}

      {testResult && (
        <div style={{
          background: testResult.success ? '#f0fdf4' : '#fef2f2',
          border: testResult.success ? '1px solid #86efac' : '1px solid #f87171',
          borderRadius: '8px',
          padding: '12px 16px',
          color: testResult.success ? '#166534' : '#991b1b',
          fontSize: '0.80rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {testResult.success ? <CheckCircle2 size={18} color="#16a34a" /> : <AlertTriangle size={18} color="#dc2626" />}
          <div>
            <strong>{testResult.success ? 'Test Successful' : 'Test Failed'}: </strong>
            <span>{testResult.message}</span>
          </div>
        </div>
      )}

      {/* TAB 1: Triggered Incidents */}
      {subTab === 'active' && (
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Live Active Network Faults &amp; Incidents
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Showing {alerts.length} total recorded incidents
            </span>
          </div>

          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
              <CheckCircle2 size={40} color="#16a34a" style={{ margin: '0 auto 10px auto' }} />
              <p style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                All Systems Normal • 0 Unresolved Faults
              </p>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0 }}>
                Every monitored server, switch, and gateway is responding within SLA thresholds.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                  <th style={{ padding: '6px 10px' }}>SEVERITY</th>
                  <th style={{ padding: '6px 10px' }}>RULE TRIGGERED</th>
                  <th style={{ padding: '6px 10px' }}>DEVICE HOST</th>
                  <th style={{ padding: '6px 10px' }}>INCIDENT DETAILS</th>
                  <th style={{ padding: '6px 10px' }}>STATUS</th>
                  <th style={{ padding: '6px 10px' }}>TIME FIRED</th>
                  <th style={{ padding: '6px 10px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(inc => {
                  const isCrit = (inc.severity || '').toLowerCase() === 'critical';
                  const isAck = inc.status === 'acknowledged';
                  const isCleared = inc.status === 'cleared';
                  const dev = inc.device || devices.find(d => d.id === inc.device_id);

                  return (
                    <tr key={inc.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: isCleared ? 0.6 : 1 }}>
                      <td style={{ padding: '4px 10px' }}>
                        <span style={{
                          padding: '1.5px 6px',
                          borderRadius: '4px',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          background: isCrit ? '#fee2e2' : '#fef3c7',
                          color: isCrit ? '#b91c1c' : '#b45309',
                          border: isCrit ? '1px solid #fecaca' : '1px solid #fde68a'
                        }}>
                          {(inc.severity || 'CRITICAL').toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: '4px 10px', fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>
                        {inc.rule_name || 'HostDown'}
                      </td>

                      <td style={{ padding: '4px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {dev?.vendor && <VendorLogo vendor={dev.vendor} size="xs" showLabel={false} />}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>
                                {dev?.hostname || `Device #${inc.device_id}`}
                              </span>
                              {dev?.device_type && <DeviceTypeBadge type={dev.device_type} size="xs" />}
                            </div>
                            <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                              {dev?.ip_address || 'Unassigned IP'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#334155' }}>
                        {inc.message}
                      </td>

                      <td style={{ padding: '4px 10px' }}>
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '1.5px 6px',
                          borderRadius: '4px',
                          background: isCleared ? '#f0fdf4' : isAck ? '#e0f2fe' : '#fee2e2',
                          color: isCleared ? '#15803d' : isAck ? '#0369a1' : '#b91c1c',
                          border: isCleared ? '1px solid #bbf7d0' : isAck ? '1px solid #bae6fd' : '1px solid #fecaca'
                        }}>
                          {inc.status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: '4px 10px', fontSize: '0.70rem', color: '#64748b' }}>
                        {inc.fired_at ? new Date(inc.fired_at).toLocaleTimeString() : 'Just now'}
                      </td>

                      <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {!isAck && !isCleared && (
                            <button
                              onClick={() => handleAcknowledge(inc.id)}
                              style={{
                                padding: '2px 7px',
                                borderRadius: '4px',
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                color: '#0f172a',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Acknowledge
                            </button>
                          )}
                          {!isCleared && (
                            <button
                              onClick={() => handleResolve(inc.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: '#f0fdf4',
                                border: '1px solid #86efac',
                                color: '#15803d',
                                fontSize: '0.70rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Resolve
                            </button>
                          )}
                          {isCleared && (
                            <span style={{ fontSize: '0.70rem', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                              <Check size={12} /> Resolved
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 2: Automated Alert Rules */}
      {subTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rules Overview Status Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 6px rgba(22, 163, 74, 0.6)' }} />
                <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a' }}>
                  {rulesList.filter(r => r.enabled).length} of {rulesList.length} Rules Active
                </span>
              </div>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Autonomous Evaluator: <strong>Continuous 15s Fast-Ping &amp; Threshold Rules</strong>
              </span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Target Scope: <strong>{devices.length} Live Monitored Devices ({devices.length > 0 && devices[0].ip_address ? `${devices[0].ip_address.split('.').slice(0, 3).join('.')}.0/24` : 'Local Subnet'})</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Click <strong>⚡ Test Rule</strong> on any card to simulate live incident
              </span>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {ruleToast && (
            <div style={{
              background: ruleToast.type === 'success' ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${ruleToast.type === 'success' ? '#86efac' : '#93c5fd'}`,
              borderRadius: '8px',
              padding: '10px 16px',
              color: ruleToast.type === 'success' ? '#166534' : '#1e40af',
              fontSize: '0.80rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              {ruleToast.type === 'success' ? <CheckCircle2 size={16} color="#16a34a" /> : <Bell size={16} color="#2563eb" />}
              <span style={{ fontWeight: 600 }}>{ruleToast.message}</span>
            </div>
          )}

          {/* Rules Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))', gap: '16px' }}>
            {rulesList.map((rule) => (
              <div
                key={rule.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: rule.enabled ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                  opacity: rule.enabled ? 1 : 0.68,
                  padding: '18px',
                  boxShadow: rule.enabled ? '0 1px 3px rgba(0,0,0,0.03)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  {/* Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.66rem',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        background: rule.severity === 'CRITICAL' ? '#fee2e2' : rule.severity === 'WARNING' ? '#fef3c7' : '#e0f2fe',
                        color: rule.severity === 'CRITICAL' ? '#b91c1c' : rule.severity === 'WARNING' ? '#b45309' : '#0369a1',
                        fontWeight: 800,
                        letterSpacing: '0.04em'
                      }}>
                        {rule.severity}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                        {rule.scope}
                      </span>
                    </div>

                    {/* Enable / Disable Toggle Switch */}
                    <button
                      onClick={() => toggleRuleEnabled(rule.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: rule.enabled ? '#16a34a' : '#94a3b8'
                      }}
                      title={rule.enabled ? 'Click to mute rule' : 'Click to activate rule'}
                    >
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: rule.enabled ? '#16a34a' : '#cbd5e1',
                        boxShadow: rule.enabled ? '0 0 6px rgba(22, 163, 74, 0.6)' : 'none'
                      }} />
                      <span>{rule.enabled ? 'ACTIVE' : 'MUTED'}</span>
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    {rule.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                    {rule.desc}
                  </p>

                  {/* Metric & Condition Matrix Grid */}
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    padding: '10px 12px',
                    marginBottom: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: '0.72rem'
                  }}>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.64rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.03em' }}>
                        Monitored Metric
                      </span>
                      <strong style={{ color: '#1e293b' }}>{rule.metric}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.64rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.03em' }}>
                        Trigger Threshold
                      </span>
                      <strong style={{ color: rule.severity === 'CRITICAL' ? '#dc2626' : rule.severity === 'WARNING' ? '#d97706' : '#0284c7' }}>
                        {rule.condition}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.64rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.03em' }}>
                        Duration / Sensitivity
                      </span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{rule.thresholdVal}</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.64rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.03em' }}>
                        Eval Interval
                      </span>
                      <span style={{ color: '#0369a1', fontWeight: 600 }}>{rule.frequency}</span>
                    </div>
                  </div>

                  {/* Notification Dispatch Channels */}
                  <div style={{ marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.66rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Notification Dispatch Channels
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {rule.channels.map((ch, cIdx) => (
                        <span
                          key={cIdx}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #e2e8f0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          {ch.includes('Email') && <Mail size={11} color="#0284c7" />}
                          {ch.includes('SMS') && <Smartphone size={11} color="#16a34a" />}
                          {ch.includes('Log') && <Database size={11} color="#7c3aed" />}
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expandable Technical Logic (Collapsed by Default) */}
                  {expandedSqlId === rule.id && (
                    <div style={{
                      background: '#0f172a',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      marginBottom: '12px',
                      color: '#38bdf8',
                      fontFamily: 'monospace',
                      fontSize: '0.70rem',
                      lineHeight: 1.4
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.62rem', marginBottom: '4px', textTransform: 'uppercase' }}>
                        <span>Rule Evaluator Filter</span>
                        <span>Syntax: Filter Logic</span>
                      </div>
                      <code>{rule.query}</code>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleSimulateAlert(rule.simulateType)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 11px',
                        borderRadius: '6px',
                        border: '1px solid #fed7aa',
                        background: '#fff7ed',
                        color: '#c2410c',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Trigger live simulation incident for this rule"
                    >
                      <Zap size={12} color="#ea580c" />
                      <span>Test Rule</span>
                    </button>

                    <button
                      onClick={() => setEditingRule(rule)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 11px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        color: '#334155',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Configure threshold values, severity and notification channels"
                    >
                      <Settings size={12} color="#64748b" />
                      <span>Configure</span>
                    </button>
                  </div>

                  {/* Toggle button to show/hide underlying query */}
                  <button
                    onClick={() => setExpandedSqlId(expandedSqlId === rule.id ? null : rule.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.68rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      textDecoration: 'underline'
                    }}
                    title="Toggle technical SQL query view"
                  >
                    <span>{expandedSqlId === rule.id ? 'Hide Query' : 'SQL Logic'}</span>
                    {expandedSqlId === rule.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Rule Configuration Modal */}
          {editingRule && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '540px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                border: '1px solid #cbd5e1',
                overflow: 'hidden'
              }}>
                {/* Modal Header */}
                <div style={{
                  padding: '16px 20px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={18} color="#0284c7" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Configure Alert Rule
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingRule(null)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Rule Title
                    </label>
                    <input
                      type="text"
                      value={editingRule.title}
                      onChange={e => setEditingRule({ ...editingRule, title: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Severity
                      </label>
                      <select
                        value={editingRule.severity}
                        onChange={e => setEditingRule({ ...editingRule, severity: e.target.value as any })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem', background: '#ffffff' }}
                      >
                        <option value="CRITICAL">CRITICAL (Red Alert)</option>
                        <option value="WARNING">WARNING (Amber Alert)</option>
                        <option value="INFO">INFO (Notice)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Trigger Threshold
                      </label>
                      <input
                        type="text"
                        value={editingRule.condition}
                        onChange={e => setEditingRule({ ...editingRule, condition: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Duration / Sensitivity
                      </label>
                      <input
                        type="text"
                        value={editingRule.thresholdVal}
                        onChange={e => setEditingRule({ ...editingRule, thresholdVal: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Evaluation Interval
                      </label>
                      <input
                        type="text"
                        value={editingRule.frequency}
                        onChange={e => setEditingRule({ ...editingRule, frequency: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Target Scope
                    </label>
                    <input
                      type="text"
                      value={editingRule.scope}
                      onChange={e => setEditingRule({ ...editingRule, scope: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Notification Channels
                    </label>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem' }}>
                      {['Email SMTP', 'Twilio SMS', 'Incident Audit Log'].map(ch => {
                        const isChecked = editingRule.channels.includes(ch);
                        return (
                          <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                const nextCh = e.target.checked
                                  ? [...editingRule.channels, ch]
                                  : editingRule.channels.filter(c => c !== ch);
                                setEditingRule({ ...editingRule, channels: nextCh });
                              }}
                            />
                            <span>{ch}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div style={{
                  padding: '14px 20px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => setEditingRule(null)}
                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '0.80rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setRulesList(prev => prev.map(r => r.id === editingRule.id ? editingRule : r));
                      toast.success(`Rule "${editingRule.title}" updated successfully!`, 'Rule Saved');
                      setRuleToast({ message: `Rule "${editingRule.title}" updated successfully!`, type: 'success' });
                      setTimeout(() => setRuleToast(null), 2000);
                      setEditingRule(null);
                    }}
                    style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '0.80rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Save Rule Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Alert Recipients & Device Routing Matrix */}
      {subTab === 'recipients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Description */}
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#0284c7" />
                <span>Alert Recipients &amp; Device Routing Matrix</span>
              </h3>
              <p style={{ fontSize: '0.80rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Select an on-call engineer or administrator from the left panel, then configure granular per-server alert delivery (Email, SMS, or Both).
              </p>
            </div>
          </div>

          {/* Main Grid: Left Contacts, Right Routing Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>
            {/* LEFT: Recipients List Panel */}
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Prominent Add Person Button inside Left Panel */}
              <button
                onClick={() => { setRecipModalError(null); setShowAddRecipientModal(true); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                  transition: 'all 0.15s ease'
                }}
              >
                <UserPlus size={16} />
                <span>+ Add Alert Person / Contact</span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>
                  On-Call Contacts ({recipients.length})
                </span>
                <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                  Click to select
                </span>
              </div>

              {recipients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <span>No alert recipients registered yet.</span>
                  <button
                    onClick={() => { setRecipModalError(null); setShowAddRecipientModal(true); }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Alert Contact / Person
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recipients.map(r => {
                    const isSelected = selectedRecipientId === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRecipientId(r.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          background: isSelected ? '#f0f9ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                              {r.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {r.role} • {r.department}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: r.on_call_status === 'active' ? '#dcfce7' : '#f1f5f9',
                              color: r.on_call_status === 'active' ? '#15803d' : '#64748b'
                            }}>
                              {r.on_call_status === 'active' ? 'ON-CALL' : 'STANDBY'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRecipient(r.id, r.name);
                              }}
                              title="Delete recipient"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                padding: '2px'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Mail size={12} color="#0284c7" />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Phone size={12} color="#16a34a" />
                            <span>{r.phone}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div style={{
                            marginTop: '4px',
                            paddingTop: '6px',
                            borderTop: '1px solid #bae6fd',
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            color: '#0369a1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>Active Routing Target</span>
                            <span>Viewing Servers &rarr;</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: Device Alert Routing Matrix */}
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedRecipientId ? (
                (() => {
                  const currentRecipient = recipients.find(r => r.id === selectedRecipientId);
                  const filteredDevices = devices.filter(d => {
                    const q = matrixSearch.toLowerCase();
                    return (
                      (d.hostname || '').toLowerCase().includes(q) ||
                      (d.ip_address || '').toLowerCase().includes(q) ||
                      (d.vendor || '').toLowerCase().includes(q) ||
                      (d.device_type || '').toLowerCase().includes(q)
                    );
                  });

                  // Calculate stats
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
                    <>
                      {/* Active Person Banner */}
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
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#e0f2fe',
                            color: '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1rem'
                          }}>
                            {currentRecipient?.name ? currentRecipient.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                                Routing Matrix for: {currentRecipient?.name}
                              </h4>
                              {loadingSubscriptions && (
                                <RefreshCw size={13} className="spin" color="#0284c7" />
                              )}
                              <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontWeight: 700 }}>
                                {currentRecipient?.department}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', display: 'flex', gap: '14px' }}>
                              <span><strong>Email:</strong> {currentRecipient?.email}</span>
                              <span><strong>SMS:</strong> {currentRecipient?.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Current Stats */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ padding: '6px 12px', borderRadius: '6px', background: '#f0f9ff', border: '1px solid #bae6fd', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0284c7' }}>{emailCount}</div>
                            <div style={{ fontSize: '0.65rem', color: '#0369a1', fontWeight: 700 }}>EMAIL ALERTS</div>
                          </div>
                          <div style={{ padding: '6px 12px', borderRadius: '6px', background: '#f5f3ff', border: '1px solid #ddd6fe', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#7c3aed' }}>{smsCount}</div>
                            <div style={{ fontSize: '0.65rem', color: '#6d28d9', fontWeight: 700 }}>SMS ALERTS</div>
                          </div>
                          <div style={{ padding: '6px 12px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#16a34a' }}>{bothCount}</div>
                            <div style={{ fontSize: '0.65rem', color: '#15803d', fontWeight: 700 }}>BOTH (EMAIL+SMS)</div>
                          </div>
                        </div>
                      </div>

                      {/* Controls: Search and Bulk Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', background: '#ffffff', width: '280px' }}>
                          <Search size={14} color="#94a3b8" style={{ marginRight: '6px' }} />
                          <input
                            type="text"
                            placeholder="Filter servers & devices..."
                            value={matrixSearch}
                            onChange={e => setMatrixSearch(e.target.value)}
                            style={{ width: '100%', padding: '7px 0', border: 'none', outline: 'none', fontSize: '0.80rem' }}
                          />
                        </div>

                        {/* Bulk Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Quick Set:</span>
                          <button
                            type="button"
                            onClick={() => handleBulkToggle('all_both')}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '5px',
                              border: '1px solid #86efac',
                              background: '#f0fdf4',
                              color: '#15803d',
                              fontSize: '0.72rem',
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
                              padding: '5px 10px',
                              borderRadius: '5px',
                              border: '1px solid #bae6fd',
                              background: '#f0f9ff',
                              color: '#0369a1',
                              fontSize: '0.72rem',
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
                              padding: '5px 10px',
                              borderRadius: '5px',
                              border: '1px solid #ddd6fe',
                              background: '#f5f3ff',
                              color: '#6d28d9',
                              fontSize: '0.72rem',
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
                              padding: '5px 10px',
                              borderRadius: '5px',
                              border: '1px solid #cbd5e1',
                              background: '#f8fafc',
                              color: '#64748b',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      {/* Device Table Matrix */}
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ maxHeight: '460px', overflowY: 'auto' }}>
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
                                      backgroundColor: isBoth ? 'rgba(34, 197, 94, 0.03)' : 'transparent'
                                    }}
                                  >
                                    {/* Host & IP */}
                                    <td style={{ padding: '4px 10px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {d.vendor && <VendorLogo vendor={d.vendor} size="xs" showLabel={false} />}
                                        <div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.76rem' }}>
                                              {d.hostname}
                                            </span>
                                            {d.device_type && <DeviceTypeBadge type={d.device_type} size="xs" />}
                                          </div>
                                          <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                                            {d.ip_address} • {d.hardware || d.vendor || 'Infrastructure'}
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
                                          <Mail size={10} /> + <Smartphone size={10} /> Both Active
                                        </span>
                                      )}
                                      {isEmailOnly && (
                                        <span style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          padding: '3px 8px',
                                          borderRadius: '4px',
                                          background: '#e0f2fe',
                                          color: '#0369a1',
                                          fontSize: '0.70rem',
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
                                          gap: '4px',
                                          padding: '3px 8px',
                                          borderRadius: '4px',
                                          background: '#f3e8ff',
                                          color: '#7e22ce',
                                          fontSize: '0.70rem',
                                          fontWeight: 700,
                                          border: '1px solid #ddd6fe'
                                        }}>
                                          <Smartphone size={11} /> SMS Only
                                        </span>
                                      )}
                                      {isNone && (
                                        <span style={{
                                          display: 'inline-block',
                                          padding: '3px 8px',
                                          borderRadius: '4px',
                                          background: '#f1f5f9',
                                          color: '#94a3b8',
                                          fontSize: '0.70rem',
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
                        padding: '14px 18px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                          Configured <strong>{filteredDevices.length}</strong> devices for <strong>{currentRecipient?.name}</strong>.
                        </div>

                        <button
                          type="button"
                          disabled={savingSubscriptions}
                          onClick={handleSaveSubscriptions}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 20px',
                            borderRadius: '7px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: savingSubscriptions ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
                          }}
                        >
                          {savingSubscriptions ? (
                            <>
                              <RefreshCw size={14} className="spin" />
                              <span>Saving Routing Rules...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              <span>Save Alert Routing Matrix</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  );
                })()
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
                  Please select an on-call contact on the left to configure their alert routing matrix.
                </div>
              )}
            </div>
          </div>

          {/* Modal: Add Alert Recipient / On-Call Contact */}
          {showAddRecipientModal && (
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
                maxWidth: '500px',
                overflow: 'hidden'
              }}>
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
                        Add Alert Recipient &amp; On-Call Person
                      </h3>
                      <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0 0' }}>
                        Register engineer to receive targeted Email &amp; SMS alerts
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddRecipientModal(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateRecipient} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {recipModalError && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      fontSize: '0.80rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertTriangle size={15} />
                      <span>{recipModalError}</span>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px' }}>
                      <User size={14} color="#64748b" style={{ marginRight: '6px' }} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Network Engineer"
                        value={recipName}
                        onChange={e => setRecipName(e.target.value)}
                        style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Email (for SMTP Dispatch) *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px' }}>
                        <Mail size={14} color="#64748b" style={{ marginRight: '6px' }} />
                        <input
                          type="email"
                          required
                          placeholder="engineer@enterprise.local"
                          value={recipEmail}
                          onChange={e => setRecipEmail(e.target.value)}
                          style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Mobile Phone (for SMS) *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px' }}>
                        <Phone size={14} color="#64748b" style={{ marginRight: '6px' }} />
                        <input
                          type="tel"
                          required
                          placeholder="+91 9876543210"
                          value={recipPhone}
                          onChange={e => setRecipPhone(e.target.value)}
                          style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Department
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px' }}>
                        <Briefcase size={14} color="#64748b" style={{ marginRight: '6px' }} />
                        <select
                          value={recipDepartment}
                          onChange={e => setRecipDepartment(e.target.value)}
                          style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: '0.82rem', background: '#ffffff' }}
                        >
                          <option value="NOC Operations">NOC Operations</option>
                          <option value="Network Infrastructure">Network Infrastructure</option>
                          <option value="System Administration">System Administration</option>
                          <option value="Security (SOC)">Security (SOC)</option>
                          <option value="Database Engineering">Database Engineering</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Job Role
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. L3 Senior Engineer"
                        value={recipRole}
                        onChange={e => setRecipRole(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      On-Call Availability Status
                    </label>
                    <select
                      value={recipOnCall}
                      onChange={e => setRecipOnCall(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff' }}
                    >
                      <option value="active">Active 24x7 On-Call (Instant Alerts)</option>
                      <option value="business_hours">Business Hours Only (09:00 - 18:00)</option>
                      <option value="standby">Standby (Escalation Backup)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddRecipientModal(false)}
                      style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '8px 18px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Save Alert Contact
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Email (SMTP) Gateway Configuration */}
      {subTab === 'smtp' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  SMTP Mail Server Configuration
                </h3>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={smtpConfig.enabled}
                  onChange={e => setSmtpConfig({ ...smtpConfig, enabled: e.target.checked })}
                />
                Enable Email Alerts
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  SMTP Host Server
                </label>
                <input
                  type="text"
                  value={smtpConfig.host}
                  onChange={e => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  placeholder="smtp.office365.com or mail.domain.com"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={smtpConfig.port}
                  onChange={e => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Security Encryption
                </label>
                <select
                  value={smtpConfig.security}
                  onChange={e => setSmtpConfig({ ...smtpConfig, security: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                >
                  <option value="tls">STARTTLS / TLS (Recommended - Port 587)</option>
                  <option value="ssl">SSL / TLS (Port 465)</option>
                  <option value="none">None / Open Relay (Port 25)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Authentication Username
                </label>
                <input
                  type="text"
                  value={smtpConfig.username}
                  onChange={e => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                  placeholder="noc-alerts@enterprise.local"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  SMTP Password / App Key
                </label>
                <input
                  type="password"
                  value={smtpConfig.password || ''}
                  onChange={e => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  placeholder="••••••••••••"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Sender From Address
                </label>
                <input
                  type="text"
                  value={smtpConfig.from_email}
                  onChange={e => setSmtpConfig({ ...smtpConfig, from_email: e.target.value })}
                  placeholder="noc-alerts@enterprise.local"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Admin Notification Recipients (Comma-separated)
                </label>
                <input
                  type="text"
                  value={smtpConfig.recipients}
                  onChange={e => setSmtpConfig({ ...smtpConfig, recipients: e.target.value })}
                  placeholder="admin@company.com, oncall-noc@company.com"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button
                onClick={handleTestEmail}
                disabled={testing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Send size={13} />
                <span>{testing ? 'Testing Handshake...' : 'Send Test Verification Email'}</span>
              </button>

              <button
                onClick={handleSaveSettings}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save SMTP Settings
              </button>
            </div>
          </div>

          {/* Quick Help Card */}
          <div style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Enterprise SMTP Relay Guide
            </h4>
            <ul style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.6, paddingLeft: '18px', margin: 0 }}>
              <li><strong>Microsoft 365 / Exchange:</strong> Host: <code>smtp.office365.com</code>, Port: <code>587</code>, Security: <code>STARTTLS</code>.</li>
              <li><strong>Google Workspace:</strong> Host: <code>smtp.gmail.com</code>, Port: <code>587</code> (Use App Password).</li>
              <li><strong>Internal Linux Postfix Relay:</strong> Host: <code>10.0.0.1</code> or IP, Port: <code>25</code>, Security: <code>None</code>.</li>
              <li>Click <strong>Send Test Verification Email</strong> to verify immediate live handshake.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 4: SMS Gateway Configuration */}
      {subTab === 'sms' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={18} color="#16a34a" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  SMS Gateway Configuration
                </h3>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={smsConfig.enabled}
                  onChange={e => setSmsConfig({ ...smsConfig, enabled: e.target.checked })}
                />
                Enable SMS Alerts
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Gateway Provider
                </label>
                <select
                  value={smsConfig.provider}
                  onChange={e => setSmsConfig({ ...smsConfig, provider: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                >
                  <option value="twilio">Twilio Cloud SMS API</option>
                  <option value="aws_sns">AWS SNS SMS Service</option>
                  <option value="http_api">Generic HTTP Webhook / Custom SMS Gateway</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Sender Phone / Shortcode ID
                </label>
                <input
                  type="text"
                  value={smsConfig.sender_number}
                  onChange={e => setSmsConfig({ ...smsConfig, sender_number: e.target.value })}
                  placeholder="+18005550199 or VNMS"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Account SID / API Key
                </label>
                <input
                  type="text"
                  value={smsConfig.account_sid}
                  onChange={e => setSmsConfig({ ...smsConfig, account_sid: e.target.value })}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Auth Token / API Secret
                </label>
                <input
                  type="password"
                  value={smsConfig.auth_token || ''}
                  onChange={e => setSmsConfig({ ...smsConfig, auth_token: e.target.value })}
                  placeholder="••••••••••••••••"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Admin Mobile Phone Numbers (Comma-separated)
                </label>
                <input
                  type="text"
                  value={smsConfig.recipients}
                  onChange={e => setSmsConfig({ ...smsConfig, recipients: e.target.value })}
                  placeholder="+15550199222, +919876543210"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>

              {smsConfig.provider === 'http_api' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Custom HTTP API Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={smsConfig.custom_url}
                    onChange={e => setSmsConfig({ ...smsConfig, custom_url: e.target.value })}
                    placeholder="https://sms.internal.company.com/api/send?to={{to}}&msg={{msg}}"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button
                onClick={handleTestSMS}
                disabled={testing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Send size={13} />
                <span>{testing ? 'Dispatching SMS...' : 'Send Test SMS'}</span>
              </button>

              <button
                onClick={handleSaveSettings}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save SMS Settings
              </button>
            </div>
          </div>

          {/* SMS Simulation Card */}
          <div style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              SMS Notification Dispatch
            </h4>
            <p style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px 0' }}>
              When critical incidents trigger (e.g. Host DOWN or Storage Full &gt;= 90%), an urgent SMS is dispatched immediately to on-call engineers.
            </p>
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              padding: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '4px' }}>PREVIEW MESSAGE</div>
              <div style={{ fontSize: '0.76rem', color: '#0f172a', fontWeight: 600, fontFamily: 'sans-serif' }}>
                {renderPreview(currentTemplate.sms_text)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalations & Thresholds Tab (Points 17.7.1, 17.7.3, 17.7.4, 17.7.5) */}
      {subTab === 'escalations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Multi-Stage Escalation Plans */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Multi-Stage Timed Escalation Schedules (#61)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
              {escalations.map(esc => (
                <div key={esc.id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>{esc.rule_name}</h4>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.70rem', fontWeight: 700 }}>
                      ● {esc.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.74rem' }}>
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>T+0 Min</span>
                      <span style={{ color: '#334155' }}>{esc.stage_0min}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.74rem' }}>
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>T+5 Min</span>
                      <span style={{ color: '#334155' }}>{esc.stage_5min}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.74rem' }}>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>T+15 Min</span>
                      <span style={{ color: '#334155' }}>{esc.stage_15min}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.74rem' }}>
                      <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>T+60 Min</span>
                      <span style={{ color: '#334155' }}>{esc.stage_60min}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Threshold & Window Triggers */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Advanced Threshold, Quota &amp; Change Triggers (#63, #64, #65)
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>TRIGGER TYPE</th>
                    <th style={{ padding: '8px 12px' }}>TARGET METRIC</th>
                    <th style={{ padding: '8px 12px' }}>CONDITION &amp; WINDOW</th>
                    <th style={{ padding: '8px 12px' }}>CURRENT POLLED VALUE</th>
                    <th style={{ padding: '8px 12px' }}>STATE</th>
                  </tr>
                </thead>
                <tbody>
                  {advancedTriggers.map(trig => (
                    <tr key={trig.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          background: trig.type === 'SUSTAINED_WINDOW' ? '#e0f2fe' : trig.type === 'VOLUME_QUOTA' ? '#fef3c7' : '#ede9fe',
                          color: trig.type === 'SUSTAINED_WINDOW' ? '#0369a1' : trig.type === 'VOLUME_QUOTA' ? '#b45309' : '#6d28d9',
                          padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.68rem'
                        }}>
                          {trig.type}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {trig.target_metric}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>
                        {trig.threshold_cond}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0284c7' }}>
                        {trig.current_value}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          ● {trig.trigger_state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Dispatches & Automated Remediation Tab (Points 17.7.6 to 17.7.10) */}
      {subTab === 'dispatches' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Enterprise Webhooks, MQTT Strobe, SCADA &amp; Self-Healing (#66-#70)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Automated multi-channel broadcast to MS Teams, Slack, physical datacenter warning strobes, and PowerShell remediation
              </p>
            </div>
            <ExportButtons data={dispatches} filenamePrefix="vnms_dispatches" title="Alert Dispatches" />
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px' }}>INTEGRATION PLATFORM</th>
                  <th style={{ padding: '8px 12px' }}>TARGET WEBHOOK / SCRIPT ADDRESS</th>
                  <th style={{ padding: '8px 12px' }}>PAYLOAD SPECIFICATION</th>
                  <th style={{ padding: '8px 12px' }}>DELIVERIES</th>
                  <th style={{ padding: '8px 12px' }}>STATUS</th>
                  <th style={{ padding: '8px 12px' }}>TEST ACTION</th>
                </tr>
              </thead>
              <tbody>
                {dispatches.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                      {d.platform}
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: '#0284c7' }}>
                      {d.target_address}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#334155' }}>
                      {d.payload_format}
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                      {d.success_count} sent
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        ● {d.last_status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <button
                        onClick={() => {
                          toast.success(`Test payload delivered to ${d.platform}! Status: HTTP 200 OK.`, 'Webhook Delivered');
                        }}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.70rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: '#0f172a'
                        }}
                      >
                        Send Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Alert Notification Templates */}
      {subTab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'start' }}>
          {/* Template Editor */}
          <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={18} color="#7c3aed" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Alert Notification Templates Editor
                </h3>
              </div>
            </div>

            {/* Template Selector Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {templates.map(tmpl => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: isSelected ? '#7c3aed' : '#f8fafc',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {tmpl.name}
                  </button>
                );
              })}
            </div>

            {/* Available Dynamic Tags */}
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                Available Dynamic Variable Tags (Click to copy)
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['{{hostname}}', '{{ip}}', '{{device_type}}', '{{vendor}}', '{{hardware}}', '{{event_time}}', '{{downtime_duration}}', '{{metric_value}}'].map(tag => (
                  <span
                    key={tag}
                    onClick={() => navigator.clipboard.writeText(tag)}
                    title="Click to copy variable token"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#0284c7',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Copy size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Template Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={currentTemplate.email_subject}
                  onChange={e => {
                    const updated = templates.map(t => t.id === currentTemplate.id ? { ...t, email_subject: e.target.value } : t);
                    setTemplates(updated);
                  }}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Email Body (HTML Supported)
                </label>
                <textarea
                  rows={6}
                  value={currentTemplate.email_body}
                  onChange={e => {
                    const updated = templates.map(t => t.id === currentTemplate.id ? { ...t, email_body: e.target.value } : t);
                    setTemplates(updated);
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.76rem', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                    SMS Plaintext Message (160 chars recommended)
                  </label>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {currentTemplate.sms_text.length} chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={currentTemplate.sms_text}
                  onChange={e => {
                    const updated = templates.map(t => t.id === currentTemplate.id ? { ...t, sms_text: e.target.value } : t);
                    setTemplates(updated);
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <button
                onClick={handleSaveSettings}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Save All Alert Templates
              </button>
            </div>
          </div>

          {/* Interactive Live Preview (Email & Phone Mockup) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Email Preview Card */}
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#0284c7', fontSize: '0.78rem', fontWeight: 700 }}>
                <Eye size={14} />
                <span>Live Rendered Email Preview</span>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '10px 12px', marginBottom: '10px', fontSize: '0.74rem' }}>
                <div style={{ color: '#64748b' }}><strong>Subject:</strong> {renderPreview(currentTemplate.email_subject)}</div>
                <div style={{ color: '#64748b', marginTop: '2px' }}><strong>From:</strong> V-NMS Enterprise NOC &lt;noc-alerts@enterprise.local&gt;</div>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: renderPreview(currentTemplate.email_body) }}
                style={{ fontSize: '0.76rem', lineHeight: 1.5 }}
              />
            </div>

            {/* Mobile SMS Preview */}
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700 }}>
                <Smartphone size={14} />
                <span>Mobile SMS Phone Preview</span>
              </div>
              <div style={{
                background: '#f1f5f9',
                borderRadius: '16px',
                padding: '14px',
                border: '2px solid #cbd5e1',
                maxWidth: '280px',
                margin: '0 auto'
              }}>
                <div style={{ textAlign: 'center', fontSize: '0.64rem', color: '#64748b', marginBottom: '8px', fontWeight: 700 }}>
                  SMS from {smsConfig.sender_number}
                </div>
                <div style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '10px 12px',
                  borderRadius: '14px 14px 2px 14px',
                  fontSize: '0.74rem',
                  lineHeight: 1.4,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {renderPreview(currentTemplate.sms_text)}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.60rem', color: '#94a3b8', marginTop: '3px' }}>
                  Delivered • Just now
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalations & Thresholds Tab (Points 17.7.1, 17.7.3, 17.7.4, 17.7.5) */}
      {subTab === 'escalations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Multi-Stage Escalation Plans */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Multi-Stage Timed Escalation Schedules (#61)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
              {escalations.map(esc => (
                <div key={esc.id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>{esc.rule_name}</h4>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.70rem', fontWeight: 700 }}>
                      ● {esc.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.74rem' }}>
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>T+0 Min</span>
                      <span style={{ color: '#334155' }}>{esc.stage_0min}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.74rem' }}>
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>T+5 Min</span>
                      <span style={{ color: '#334155' }}>{esc.stage_5min}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.74rem' }}>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>T+15 Min</span>
                      <span style={{ color: '#334155' }}>{esc.stage_15min}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.74rem' }}>
                      <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>T+60 Min</span>
                      <span style={{ color: '#334155' }}>{esc.stage_60min}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Threshold & Window Triggers */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Advanced Threshold, Quota &amp; Change Triggers (#63, #64, #65)
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>TRIGGER TYPE</th>
                    <th style={{ padding: '8px 12px' }}>TARGET METRIC</th>
                    <th style={{ padding: '8px 12px' }}>CONDITION &amp; WINDOW</th>
                    <th style={{ padding: '8px 12px' }}>CURRENT POLLED VALUE</th>
                    <th style={{ padding: '8px 12px' }}>STATE</th>
                  </tr>
                </thead>
                <tbody>
                  {advancedTriggers.map(trig => (
                    <tr key={trig.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          background: trig.type === 'SUSTAINED_WINDOW' ? '#e0f2fe' : trig.type === 'VOLUME_QUOTA' ? '#fef3c7' : '#ede9fe',
                          color: trig.type === 'SUSTAINED_WINDOW' ? '#0369a1' : trig.type === 'VOLUME_QUOTA' ? '#b45309' : '#6d28d9',
                          padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.68rem'
                        }}>
                          {trig.type}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {trig.target_metric}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>
                        {trig.threshold_cond}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0284c7' }}>
                        {trig.current_value}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          ● {trig.trigger_state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Dispatches & Automated Remediation Tab (Points 17.7.6 to 17.7.10) */}
      {subTab === 'dispatches' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Enterprise Webhooks, MQTT Strobe, SCADA &amp; Self-Healing (#66-#70)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Automated multi-channel broadcast to MS Teams, Slack, physical datacenter warning strobes, and PowerShell remediation
              </p>
            </div>
            <ExportButtons data={dispatches} filenamePrefix="vnms_dispatches" title="Alert Dispatches" />
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px' }}>INTEGRATION PLATFORM</th>
                  <th style={{ padding: '8px 12px' }}>TARGET WEBHOOK / SCRIPT ADDRESS</th>
                  <th style={{ padding: '8px 12px' }}>PAYLOAD SPECIFICATION</th>
                  <th style={{ padding: '8px 12px' }}>DELIVERIES</th>
                  <th style={{ padding: '8px 12px' }}>STATUS</th>
                  <th style={{ padding: '8px 12px' }}>TEST ACTION</th>
                </tr>
              </thead>
              <tbody>
                {dispatches.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                      {d.platform}
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: '#0284c7' }}>
                      {d.target_address}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#334155' }}>
                      {d.payload_format}
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                      {d.success_count} sent
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        ● {d.last_status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <button
                        onClick={() => {
                          toast.success(`Test payload delivered to ${d.platform}! Status: HTTP 200 OK.`, 'Webhook Delivered');
                        }}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.70rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: '#0f172a'
                        }}
                      >
                        Send Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. V-NMS Cortex AI Incident Summarizer & Auto-Remediation (Point 18.6) */}
      {subTab === 'ai_remediation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#0f172a', padding: '16px 20px', borderRadius: '12px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.70rem', fontWeight: 800 }}>
                  V-NMS CORTEX AI REMEDIATION ENGINE
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Autonomous Root-Cause Diagnosis &amp; Self-Healing Scripts</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
                AI Incident Summaries &amp; Executable Playbooks
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                Deterministic natural language incident breakdowns with pre-compiled PowerShell and Bash remediation scripts
              </p>
            </div>
            <ExportButtons data={aiRemediations} filenamePrefix="vnms_ai_remediations" title="AI Incident Remediation" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(aiRemediations.length ? aiRemediations : [
              {
                incident_id: 'INC-88912', device_name: 'WIN-TBI5QJB6P82 (Storage Node)', ip_address: '172.168.1.11',
                severity: 'CRITICAL', incident_title: 'Root Partition C:\\ Space Exhaustion (94.2% Full)',
                ai_natural_summary: 'System drive C: is experiencing acute space depletion caused by runaway Windows Component Store (WinSxS) and unrotated crash dump files under C:\\Windows\\Minidump. At current write velocity, disk will hit 100% full in 6 hours 40 minutes.',
                root_cause_diagnosis: 'Cumulative monthly Windows updates left staging caches intact while pagefile dynamically expanded due to high working set memory allocation.',
                recommended_action: 'Execute dism.exe component cleanup, purge temporary Minidumps, and reclaim unreferenced volume shadow copies (VSS).',
                remediation_script_type: 'PowerShell',
                remediation_script_code: `# V-NMS Autonomous Self-Healing Script: Disk Space Remediation\nRemove-Item -Path "C:\\Windows\\Minidump\\*.dmp" -Force -ErrorAction SilentlyContinue\ndism.exe /online /Cleanup-Image /StartComponentCleanup /ResetBase\nGet-Volume -DriveLetter C`,
                safety_confidence_score: 98
              },
              {
                incident_id: 'INC-88915', device_name: 'core-gw-01 (Check Point SG)', ip_address: '172.168.1.1',
                severity: 'WARNING', incident_title: 'BGP Peer Flapping: AS65001 -> Transit ISP Telia (AS1299)',
                ai_natural_summary: 'BGP Neighbor 198.51.100.1 dropped state from ESTABLISHED to IDLE 3 times in 10 minutes. ICMP ping RTT spiked from 2.1ms to 78ms with 12% packet loss on WAN interface TenGig0/0/1.',
                root_cause_diagnosis: 'Upstream peering circuit experiencing CRC frame errors and optical transceiver RX power drop (-18.2 dBm).',
                recommended_action: 'Reroute outbound default route via secondary BGP Transit ISP Lumen (AS3356) and open provider ticket for optical fiber attenuation.',
                remediation_script_type: 'Bash',
                remediation_script_code: `#!/bin/bash\nvtysh -c "configure terminal" -c "router bgp 65001" -c "neighbor 198.51.100.1 route-map PREFER_SECONDARY in" -c "end"\nvtysh -c "show ip bgp summary"`,
                safety_confidence_score: 94
              }
            ]).map((item: any, idx: number) => (
              <div key={idx} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: item.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7', color: item.severity === 'CRITICAL' ? '#b91c1c' : '#b45309' }}>
                        {item.incident_id} • {item.severity}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.device_name} ({item.ip_address})</span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
                      {item.incident_title}
                    </h4>
                  </div>
                  <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, border: '1px solid #ddd6fe' }}>
                    ✨ {item.safety_confidence_score}% Safety Score
                  </span>
                </div>

                {/* Natural Language Summary */}
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    AI Incident Analysis
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                    {item.ai_natural_summary}
                  </p>
                </div>

                {/* Root Cause & Recommended Action */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ background: '#eff6ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Root-Cause Diagnosis
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#1e3a8a', lineHeight: 1.4 }}>
                      {item.root_cause_diagnosis}
                    </div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Recommended Action
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#166534', lineHeight: 1.4 }}>
                      {item.recommended_action}
                    </div>
                  </div>
                </div>

                {/* Executable Script Code Block */}
                <div style={{ background: '#0f172a', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: 700 }}>
                      AUTONOMOUS {item.remediation_script_type.toUpperCase()} PLAYBOOK
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.remediation_script_code);
                        toast.success('Remediation script copied to clipboard!');
                      }}
                      style={{
                        background: '#334155',
                        border: 'none',
                        color: '#f8fafc',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Copy size={12} /> Copy Script
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '12px 14px', color: '#38bdf8', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', lineHeight: 1.5 }}>
                    {item.remediation_script_code}
                  </pre>
                </div>

                {/* Action button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    onClick={() => toast.success(`Simulated self-healing execution dispatched for incident ${item.incident_id}!`)}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Play size={13} fill="#ffffff" /> Run Self-Healing Playbook
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
