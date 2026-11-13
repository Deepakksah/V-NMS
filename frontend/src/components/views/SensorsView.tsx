import React, { useState } from 'react';
import { 
  Thermometer, 
  Cpu, 
  Database, 
  HardDrive, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';
import { 
  MOCK_SENSORS, 
  MOCK_PROCESSORS, 
  MOCK_MEMPOOLS, 
  MOCK_STORAGE, 
  MOCK_DISK_IO 
} from '../../data/mockEnterpriseData';

export const SensorsView: React.FC = () => {
  const [subTab, setSubTab] = useState<'sensors' | 'processors' | 'mempools' | 'storage' | 'disk_io'>('sensors');

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`;
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Sensors, Metrics & Environmental Health</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Models #26 - #35
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Thermal monitors, Fan RPM, Voltage rails, Multi-core CPU telemetry, Memory pools & Disk IOPS
          </p>
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'sensors', label: 'Environmental Sensors (#26-#30)', icon: Thermometer, count: MOCK_SENSORS.length },
          { id: 'processors', label: 'Multi-Core CPUs (#31)', icon: Cpu, count: MOCK_PROCESSORS.length },
          { id: 'mempools', label: 'Memory Pools (#32)', icon: Database, count: MOCK_MEMPOOLS.length },
          { id: 'storage', label: 'Disks & Partitions (#33)', icon: HardDrive, count: MOCK_STORAGE.length },
          { id: 'disk_io', label: 'Disk IOPS & Net-SNMP (#34, #35)', icon: TrendingUp, count: MOCK_DISK_IO.length }
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

      {/* Sensors View */}
      {subTab === 'sensors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {MOCK_SENSORS.map(sensor => (
            <div key={sensor.id} className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {sensor.sensorClass}
                </span>

                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: sensor.state === 'OK' ? '#16a34a' : '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {sensor.state === 'OK' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                  {sensor.state}
                </span>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                {sensor.sensorDescr}
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>
                {sensor.deviceHostname}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                  {sensor.currentValue}
                </span>
                <span style={{ fontSize: '1rem', color: '#0284c7', fontWeight: 700 }}>
                  {sensor.unit}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Low: {sensor.limitLow}{sensor.unit}</span>
                <span>High: {sensor.limitHigh}{sensor.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-Core CPUs */}
      {subTab === 'processors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_PROCESSORS.map(proc => (
            <div key={proc.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>
                  {proc.cores} Cores Active
                </span>
                <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 700 }}>
                  {proc.temperatureC}°C
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                {proc.name}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>
                {proc.deviceHostname}
              </p>

              {/* Progress Bar */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Utilization</span>
                  <span style={{ fontWeight: 800, color: proc.utilization > 80 ? '#dc2626' : '#16a34a' }}>
                    {proc.utilization}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{
                    width: `${proc.utilization}%`,
                    height: '100%',
                    background: proc.utilization > 80 
                      ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
                      : 'linear-gradient(90deg, #0284c7, #16a34a)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Pools */}
      {subTab === 'mempools' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_MEMPOOLS.map(mem => (
            <div key={mem.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#7e22ce', fontWeight: 700 }}>
                MEMORY POOL
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '8px', marginBottom: '4px' }}>
                {mem.poolName}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>
                {mem.deviceHostname}
              </p>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>{formatBytes(mem.usedBytes)} of {formatBytes(mem.totalBytes)}</span>
                  <span style={{ fontWeight: 800, color: mem.percentUsed > 80 ? '#dc2626' : '#0284c7' }}>
                    {mem.percentUsed.toFixed(1)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{
                    width: `${mem.percentUsed}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Storage */}
      {subTab === 'storage' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Filesystem & Disk Storage (Model #33)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>DEVICE</th>
                <th style={{ padding: '10px 14px' }}>MOUNT POINT</th>
                <th style={{ padding: '10px 14px' }}>FS TYPE</th>
                <th style={{ padding: '10px 14px' }}>USED / TOTAL</th>
                <th style={{ padding: '10px 14px' }}>UTILIZATION</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STORAGE.map(st => (
                <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{st.deviceHostname}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                    {st.mountPoint}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{st.fileSystem}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>
                    {st.usedGb} GB / {st.totalGb} GB
                  </td>
                  <td style={{ padding: '12px 14px', width: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{ width: `${st.percentUsed}%`, height: '100%', background: st.percentUsed > 80 ? '#dc2626' : '#16a34a' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', width: '40px' }}>{st.percentUsed}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Disk IOPS */}
      {subTab === 'disk_io' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_DISK_IO.map(io => (
            <div key={io.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                MODEL #34 & #35 DISK I/O
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '8px', marginBottom: '2px' }}>
                {io.deviceDisk}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>
                {io.deviceHostname}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Read IOPS</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{io.readIops.toLocaleString()}</div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{io.readThroughputMb} MB/s</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Write IOPS</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7e22ce', marginTop: '2px' }}>{io.writeIops.toLocaleString()}</div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{io.writeThroughputMb} MB/s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
