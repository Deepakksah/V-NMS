import type { Device } from '../types';

export interface DeviceTelemetryPoint {
  time: string;
  inTraffic: number;     // in Mbps or Gbps
  outTraffic: number;    // in Mbps or Gbps
  cpu: number;           // in %
  memory: number;        // in %
  latency: number;       // in ms
  packetsPerSec: number; // in pps
}

export interface DeviceInterfaceDetail {
  name: string;
  speed: string;
  status: 'up' | 'down';
  inBps: string;
  outBps: string;
  errors: number;
}

// Generates unique realistic multi-metric chart history for ANY device (server, switch, router)
export const getDeviceTelemetryHistory = (device: Device): DeviceTelemetryPoint[] => {
  const isServer = device.hostname.includes('srv') || device.hostname.includes('host') || device.os.toLowerCase().includes('linux') || device.os.toLowerCase().includes('windows');
  const isSwitch = device.hostname.includes('sw') || device.hardware?.toLowerCase().includes('catalyst') || device.hardware?.toLowerCase().includes('arista') || device.hardware?.toLowerCase().includes('switch');
  
  const baseLatency = device.last_ping_ms > 0 ? device.last_ping_ms : (isServer ? 1.2 : isSwitch ? 1.8 : 12.5);

  const hours = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00'];
  
  return hours.map((hour, idx) => {
    // Generate deterministic yet lively waves based on device id and hour index
    const wave = Math.sin((idx + device.id) * 0.8);
    const noise = (Math.cos((idx * 2) + device.id) + 1) * 0.5;

    let inTraffic = 0;
    let outTraffic = 0;
    let cpu = 0;
    let memory = 0;

    if (isServer) {
      // Server Profile: High Memory, Multi-core CPU load, steady gigabit traffic
      inTraffic = Number((1.2 + wave * 0.4 + noise * 0.3).toFixed(2)); // Gbps
      outTraffic = Number((2.8 + wave * 0.9 + noise * 0.4).toFixed(2));
      cpu = Math.round(35 + wave * 18 + noise * 12); // 25% - 65%
      memory = Math.round(62 + wave * 6 + noise * 4); // 58% - 72%
    } else if (isSwitch) {
      // Switch Profile: Massive Port Traffic, Low CPU, Low Memory
      inTraffic = Number((14.5 + wave * 5.2 + noise * 2.1).toFixed(1)); // Gbps
      outTraffic = Number((18.2 + wave * 6.4 + noise * 2.8).toFixed(1));
      cpu = Math.round(18 + wave * 8 + noise * 4); // 12% - 30%
      memory = Math.round(34 + wave * 3 + noise * 2); // 30% - 40%
    } else {
      // Core Router / Edge Gateway Profile
      inTraffic = Number((38.4 + wave * 14.2 + noise * 4.5).toFixed(1)); // Gbps
      outTraffic = Number((42.1 + wave * 16.0 + noise * 5.2).toFixed(1));
      cpu = Math.round(28 + wave * 12 + noise * 6); // 20% - 46%
      memory = Math.round(48 + wave * 5 + noise * 3); // 45% - 56%
    }

    const latency = Number(Math.max(0.4, baseLatency + wave * 0.4 + (noise - 0.5) * 0.3).toFixed(2));
    const packetsPerSec = Math.round((inTraffic + outTraffic) * 125000);

    return {
      time: hour,
      inTraffic,
      outTraffic,
      cpu: Math.min(99, Math.max(5, cpu)),
      memory: Math.min(99, Math.max(10, memory)),
      latency,
      packetsPerSec
    };
  });
};

// Generates interface ports for the selected device
export const getDeviceInterfaces = (device: Device): DeviceInterfaceDetail[] => {
  const isServer = device.hostname.includes('srv') || device.hostname.includes('host') || device.os.toLowerCase().includes('linux') || device.os.toLowerCase().includes('windows');
  const isSwitch = device.hostname.includes('sw') || device.hardware?.toLowerCase().includes('catalyst') || device.hardware?.toLowerCase().includes('arista') || device.hardware?.toLowerCase().includes('switch');

  if (isServer) {
    return [
      { name: 'eth0 (Management)', speed: '1 Gbps', status: 'up', inBps: '48.2 Mbps', outBps: '124.5 Mbps', errors: 0 },
      { name: 'eth1 (Storage iSCSI)', speed: '10 Gbps', status: 'up', inBps: '1.4 Gbps', outBps: '2.1 Gbps', errors: 0 },
      { name: 'eth2 (VM Traffic Trunk)', speed: '25 Gbps', status: 'up', inBps: '4.8 Gbps', outBps: '5.2 Gbps', errors: 0 },
      { name: 'eth3 (Backup Standby)', speed: '10 Gbps', status: 'down', inBps: '0 bps', outBps: '0 bps', errors: 0 }
    ];
  } else if (isSwitch) {
    return [
      { name: 'GigabitEthernet1/0/1 (Uplink to Core)', speed: '40 Gbps', status: 'up', inBps: '12.4 Gbps', outBps: '15.8 Gbps', errors: 0 },
      { name: 'TenGigabitEthernet1/0/2 (Server Trunk 01)', speed: '10 Gbps', status: 'up', inBps: '4.2 Gbps', outBps: '5.1 Gbps', errors: 0 },
      { name: 'TenGigabitEthernet1/0/3 (Server Trunk 02)', speed: '10 Gbps', status: 'up', inBps: '3.8 Gbps', outBps: '4.4 Gbps', errors: 0 },
      { name: 'GigabitEthernet1/0/24 (Floor 3 AP PoE)', speed: '1 Gbps', status: 'up', inBps: '184.2 Mbps', outBps: '320.1 Mbps', errors: 0 },
      { name: 'GigabitEthernet1/0/48 (Admin Workstation)', speed: '1 Gbps', status: 'up', inBps: '14.5 Mbps', outBps: '22.0 Mbps', errors: 0 }
    ];
  } else {
    // Router / Edge Gateway
    return [
      { name: 'HundredGigE0/0/0 (Transit ISP A)', speed: '100 Gbps', status: 'up', inBps: '24.2 Gbps', outBps: '28.5 Gbps', errors: 0 },
      { name: 'HundredGigE0/0/1 (Transit ISP B)', speed: '100 Gbps', status: 'up', inBps: '18.1 Gbps', outBps: '19.4 Gbps', errors: 0 },
      { name: 'TenGigE0/1/0 (IXP Mumbai Peering)', speed: '10 Gbps', status: 'up', inBps: '6.8 Gbps', outBps: '7.2 Gbps', errors: 0 },
      { name: 'GigabitEthernet0 (Out-of-Band Mgmt)', speed: '1 Gbps', status: 'up', inBps: '1.2 Mbps', outBps: '3.4 Mbps', errors: 0 }
    ];
  }
};

