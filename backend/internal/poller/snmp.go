package poller

import (
	"fmt"
	"time"
	"v-nms/internal/models"

	"github.com/gosnmp/gosnmp"
)

// Standard SNMP MIB-2 OIDs
const (
	OIDSysDescr  = "1.3.6.1.2.1.1.1.0"
	OIDSysUptime = "1.3.6.1.2.1.1.3.0"
	OIDSysName   = "1.3.6.1.2.1.1.5.0"
	OIDIfNumber  = "1.3.6.1.2.1.2.1.0"
)

type DevicePoller struct {
	Device *models.Device
}

func NewDevicePoller(device *models.Device) *DevicePoller {
	return &DevicePoller{Device: device}
}

// ConnectSNMP creates an active GoSNMP session
func (p *DevicePoller) ConnectSNMP(timeout time.Duration) (*gosnmp.GoSNMP, error) {
	version := gosnmp.Version2c
	if p.Device.SNMPVersion == "v1" {
		version = gosnmp.Version1
	} else if p.Device.SNMPVersion == "v3" {
		version = gosnmp.Version3
	}

	port := uint16(p.Device.SNMPPort)
	if port == 0 {
		port = 161
	}

	params := &gosnmp.GoSNMP{
		Target:    p.Device.IPAddress,
		Port:      port,
		Community: p.Device.SNMPCommunity,
		Version:   version,
		Timeout:   timeout,
		Retries:   2,
	}

	if err := params.Connect(); err != nil {
		return nil, fmt.Errorf("SNMP connect error: %w", err)
	}
	return params, nil
}

// PollCoreInfo queries sysDescr, sysName, and uptime
func (p *DevicePoller) PollCoreInfo() error {
	snmp, err := p.ConnectSNMP(3 * time.Second)
	if err != nil {
		return err
	}
	defer snmp.Conn.Close()

	oids := []string{OIDSysDescr, OIDSysUptime, OIDSysName}
	result, err := snmp.Get(oids)
	if err != nil {
		return fmt.Errorf("SNMP GET error: %w", err)
	}

	for _, variable := range result.Variables {
		switch variable.Name {
		case "." + OIDSysDescr, OIDSysDescr:
			if b, ok := variable.Value.([]byte); ok {
				p.Device.SysDescr = string(b)
			}
		case "." + OIDSysName, OIDSysName:
			if b, ok := variable.Value.([]byte); ok {
				p.Device.SysName = string(b)
			}
		case "." + OIDSysUptime, OIDSysUptime:
			p.Device.UptimeSeconds = int64(gosnmp.ToBigInt(variable.Value).Uint64() / 100)
		}
	}
	now := time.Now()
	p.Device.LastPolledAt = &now
	return nil
}
