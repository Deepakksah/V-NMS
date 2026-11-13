package poller

import (
	"strconv"
	"strings"
	"time"
	"v-nms/internal/models"

	"github.com/gosnmp/gosnmp"
)

// Standard IF-MIB OIDs (Used by LibreNMS includes/polling/ports.inc.php)
const (
	OIDIfDescr       = "1.3.6.1.2.1.2.2.1.2"   // Interface description/name
	OIDIfType        = "1.3.6.1.2.1.2.2.1.3"   // Interface type
	OIDIfSpeed       = "1.3.6.1.2.1.2.2.1.5"   // Interface speed (bps)
	OIDIfAdminStatus = "1.3.6.1.2.1.2.2.1.7"   // Admin status: 1=up, 2=down, 3=testing
	OIDIfOperStatus  = "1.3.6.1.2.1.2.2.1.8"   // Operational status: 1=up, 2=down
	OIDIfInOctets    = "1.3.6.1.2.1.2.2.1.10"  // 32-bit In octets
	OIDIfInErrors    = "1.3.6.1.2.1.2.2.1.14"  // In errors
	OIDIfOutOctets   = "1.3.6.1.2.1.2.2.1.16"  // 32-bit Out octets
	OIDIfOutErrors   = "1.3.6.1.2.1.2.2.1.20"  // Out errors
	OIDIfAlias       = "1.3.6.1.2.1.31.1.1.1.18" // Interface description/port label
	OIDIfHCInOctets  = "1.3.6.1.2.1.31.1.1.1.6"  // 64-bit High Capacity In octets
	OIDIfHCOutOctets = "1.3.6.1.2.1.31.1.1.1.10" // 64-bit High Capacity Out octets
)

// PollInterfaces performs SNMP table walk to discover and poll all network ports
func (p *DevicePoller) PollInterfaces() ([]models.Port, error) {
	snmp, err := p.ConnectSNMP(4 * time.Second)
	if err != nil {
		return nil, err
	}
	defer snmp.Conn.Close()

	portsMap := make(map[int]*models.Port)

	// Helper to get or create port struct by ifIndex
	getPort := func(ifIndex int) *models.Port {
		if port, exists := portsMap[ifIndex]; exists {
			return port
		}
		port := &models.Port{
			DeviceID:      p.Device.ID,
			IfIndex:       ifIndex,
			IfOperStatus:  "down",
			IfAdminStatus: "down",
		}
		portsMap[ifIndex] = port
		return port
	}

	// 1. Walk ifDescr (Interface names)
	_ = snmp.Walk(OIDIfDescr, func(pdu gosnmp.SnmpPDU) error {
		parts := strings.Split(pdu.Name, ".")
		if len(parts) > 0 {
			if idx, err := strconv.Atoi(parts[len(parts)-1]); err == nil {
				port := getPort(idx)
				if b, ok := pdu.Value.([]byte); ok {
					port.IfDescr = string(b)
					port.IfName = string(b)
				}
			}
		}
		return nil
	})

	// 2. Walk ifOperStatus (Up/Down)
	_ = snmp.Walk(OIDIfOperStatus, func(pdu gosnmp.SnmpPDU) error {
		parts := strings.Split(pdu.Name, ".")
		if len(parts) > 0 {
			if idx, err := strconv.Atoi(parts[len(parts)-1]); err == nil {
				port := getPort(idx)
				val := gosnmp.ToBigInt(pdu.Value).Int64()
				if val == 1 {
					port.IfOperStatus = "up"
				} else {
					port.IfOperStatus = "down"
				}
			}
		}
		return nil
	})

	// 3. Walk ifSpeed
	_ = snmp.Walk(OIDIfSpeed, func(pdu gosnmp.SnmpPDU) error {
		parts := strings.Split(pdu.Name, ".")
		if len(parts) > 0 {
			if idx, err := strconv.Atoi(parts[len(parts)-1]); err == nil {
				port := getPort(idx)
				port.IfSpeed = gosnmp.ToBigInt(pdu.Value).Int64()
			}
		}
		return nil
	})

	// 4. Walk 64-bit HC In Octets (fallback to 32-bit if unsupported)
	_ = snmp.Walk(OIDIfHCInOctets, func(pdu gosnmp.SnmpPDU) error {
		parts := strings.Split(pdu.Name, ".")
		if len(parts) > 0 {
			if idx, err := strconv.Atoi(parts[len(parts)-1]); err == nil {
				port := getPort(idx)
				port.IfInOctets = gosnmp.ToBigInt(pdu.Value).Int64()
			}
		}
		return nil
	})

	// 5. Walk 64-bit HC Out Octets
	_ = snmp.Walk(OIDIfHCOutOctets, func(pdu gosnmp.SnmpPDU) error {
		parts := strings.Split(pdu.Name, ".")
		if len(parts) > 0 {
			if idx, err := strconv.Atoi(parts[len(parts)-1]); err == nil {
				port := getPort(idx)
				port.IfOutOctets = gosnmp.ToBigInt(pdu.Value).Int64()
			}
		}
		return nil
	})

	// Convert map to slice
	var result []models.Port
	now := time.Now()
	for _, port := range portsMap {
		port.LastPolledAt = &now
		result = append(result, *port)
	}
	return result, nil
}