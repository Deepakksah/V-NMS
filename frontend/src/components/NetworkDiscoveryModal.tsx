import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Radio, 
  Play, 
  Terminal, 
  Clock, 
  CheckCircle2, 
  X, 
  Trash2, 
  RefreshCw,
  Server
} from 'lucide-react';

interface NetworkDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: () => void;
  apiBase: string;
}

interface ScanStatusResponse {
  is_scanning: boolean;
  start_time: string;
  last_scan_time: string;
  elapsed_seconds: number;
  total_discovered: number;
  total_scanned: number;
  total_targets: number;
  subnet_scanned: string;
  logs: string[];
}

export const NetworkDiscoveryModal: React.FC<NetworkDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  apiBase
}) => {
  const [subnet, setSubnet] = useState('172.168.1.0/24');
  const [isScanning, setIsScanning] = useState(false);
  const [statusData, setStatusData] = useState<ScanStatusResponse | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [clearLoading, setClearLoading] = useState(false);
  const [scanFinishedMsg, setScanFinishedMsg] = useState<string | null>(null);

  const logEndRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<any>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [statusData?.logs]);

  // Poller for scan status
  useEffect(() => {
    if (!isOpen) return;

    const checkStatus = async () => {
      try {
        const res = await axios.get<ScanStatusResponse>(`${apiBase}/discovery/status`);
        if (res.data) {
          setStatusData(res.data);
          setIsScanning(res.data.is_scanning);

          if (res.data.is_scanning) {
            setElapsedTime(Math.round(res.data.elapsed_seconds || 0));
          }
        }
      } catch (e) {
        // ignore
      }
    };

    checkStatus();
  }, [isOpen, apiBase]);

  // Active polling when scanning
  useEffect(() => {
    if (isScanning) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await axios.get<ScanStatusResponse>(`${apiBase}/discovery/status`);
          if (res.data) {
            setStatusData(res.data);
            setElapsedTime(Math.round(res.data.elapsed_seconds || 0));

            // Detected scan finish
            if (!res.data.is_scanning) {
              setIsScanning(false);
              setScanFinishedMsg(`✔ Scan complete! Discovered ${res.data.total_discovered} devices in ${res.data.elapsed_seconds.toFixed(1)}s.`);
              onScanComplete();
            }
          }
        } catch (e) {
          // ignore
        }
      }, 500);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isScanning, apiBase, onScanComplete]);

  if (!isOpen) return null;

  const handleStartScan = async () => {
    setScanFinishedMsg(null);
    setIsScanning(true);
    setElapsedTime(0);

    try {
      await axios.post(`${apiBase}/discovery/scan`);
    } catch (err: any) {
      setIsScanning(false);
      alert('Failed to start scan: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to CLEAR all devices and start fresh with 0 devices?')) {
      return;
    }

    setClearLoading(true);
    try {
      await axios.post(`${apiBase}/devices/clear`);
      onScanComplete();
      setScanFinishedMsg('✔ Inventory cleared! Database is completely empty.');
      setStatusData(prev => prev ? { ...prev, total_discovered: 0, logs: ['[00:00:00] Inventory reset by user. 0 devices mapped.'] } : null);
    } catch (err: any) {
      alert('Failed to clear devices: ' + (err.response?.data?.error || err.message));
    } finally {
      setClearLoading(false);
    }
  };

  const totalTargets = statusData?.total_targets || 110;
  const totalScanned = statusData?.total_scanned || 0;
  const percent = totalTargets > 0 ? Math.min(100, Math.round((totalScanned / totalTargets) * 100)) : 0;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '820px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Radio size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                Live Network Scanner &amp; Subnet Discovery
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Probes ARP Cache, ICMP Pings, and TCP Ports across your subnet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isScanning}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: isScanning ? 'not-allowed' : 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Controls & Metrics Bar */}
        <div style={{
          padding: '16px 24px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Subnet CIDR:</span>
            <input
              type="text"
              value={subnet}
              onChange={e => setSubnet(e.target.value)}
              disabled={isScanning}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#0f172a',
                width: '140px',
                background: isScanning ? '#f1f5f9' : '#ffffff'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleClearAll}
              disabled={isScanning || clearLoading}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #fca5a5',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: (isScanning || clearLoading) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={14} />
              <span>Reset Inventory</span>
            </button>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isScanning ? '#94a3b8' : '#0284c7',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: isScanning ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isScanning ? 'none' : '0 4px 10px rgba(2, 132, 199, 0.3)'
              }}
            >
              {isScanning ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Scanning Subnet...</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Start Network Discovery</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Metrics Row: Time Elapsed + Total Scanned + Online Found */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          padding: '14px 24px',
          background: '#ffffff',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Clock size={20} color="#0284c7" />
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block' }}>FETCH TIME</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {formatTimer(elapsedTime)}
              </span>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Terminal size={20} color="#6366f1" />
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block' }}>TARGET PROGRESS</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {totalScanned} / {totalTargets} ({percent}%)
              </span>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Server size={20} color="#16a34a" />
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block' }}>LIVE HOSTS DISCOVERED</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>
                {statusData?.total_discovered || 0} Online
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: '0 24px', background: '#ffffff', marginTop: '6px' }}>
          <div style={{
            height: '6px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${isScanning ? percent : (percent > 0 ? 100 : 0)}%`,
              backgroundColor: isScanning ? '#0284c7' : '#16a34a',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Finished Success Notification */}
        {scanFinishedMsg && (
          <div style={{
            margin: '10px 24px 0 24px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#15803d',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>{scanFinishedMsg}</span>
          </div>
        )}

        {/* Live Terminal Log Stream (JO JO SCAN KIYA---LOGS ME PRINT KARO) */}
        <div style={{
          padding: '14px 24px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: '260px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Terminal size={14} color="#0284c7" />
              <span>Real-Time Discovery Log Stream ({statusData?.logs?.length || 0} entries)</span>
            </span>

            {isScanning && (
              <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>
                ⚡ Streaming live probe responses...
              </span>
            )}
          </div>

          <div style={{
            flex: 1,
            backgroundColor: '#090d16',
            color: '#e2e8f0',
            borderRadius: '10px',
            padding: '14px 16px',
            fontFamily: 'Consolas, "Fira Code", monospace',
            fontSize: '0.78rem',
            lineHeight: '1.5',
            overflowY: 'auto',
            maxHeight: '320px',
            border: '1px solid #1e293b'
          }}>
            {(!statusData?.logs || statusData.logs.length === 0) ? (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                No active scan running. Click &apos;Start Network Discovery&apos; above to probe subnet {subnet} and view live output.
              </div>
            ) : (
              statusData.logs.map((logLine, idx) => {
                const isOnline = logLine.includes('ONLINE');
                const isComplete = logLine.includes('COMPLETE') || logLine.includes('🎉');
                const isTimeout = logLine.includes('Offline') || logLine.includes('timeout');

                let lineCol = '#cbd5e1';
                if (isOnline) lineCol = '#4ade80';
                else if (isComplete) lineCol = '#38bdf8';
                else if (isTimeout) lineCol = '#64748b';

                return (
                  <div key={idx} style={{ color: lineCol, marginBottom: '2px', wordBreak: 'break-all' }}>
                    {logLine}
                  </div>
                );
              })
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            disabled={isScanning}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isScanning ? 'not-allowed' : 'pointer'
            }}
          >
            {isScanning ? 'Scan in Progress...' : 'Close Window'}
          </button>
        </div>
      </div>
    </div>
  );
};

