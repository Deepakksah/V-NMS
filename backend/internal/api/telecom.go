package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type NetFlowRecord struct {
	ID          int       `json:"id"`
	SrcIP       string    `json:"src_ip"`
	DstIP       string    `json:"dst_ip"`
	SrcPort     int       `json:"src_port"`
	DstPort     int       `json:"dst_port"`
	Protocol    string    `json:"protocol"` // TCP, UDP, ICMP
	Application string    `json:"application"` // "SAP Enterprise", "Oracle SQL", "Zoom Meetings", "VoIP SIP", "HTTPS Web"
	BytesTrans  int64     `json:"bytes_trans"`
	Packets     int64     `json:"packets"`
	DurationMs  int       `json:"duration_ms"`
	Timestamp   time.Time `json:"timestamp"`
}

type VoipQualityRecord struct {
	ID            int       `json:"id"`
	TrunkName     string    `json:"trunk_name"`
	PBXServer     string    `json:"pbx_server"`
	Protocol      string    `json:"protocol"` // "SIP RFC 3261"
	JitterMs      float64   `json:"jitter_ms"`
	PacketLossPct float64   `json:"packet_loss_pct"`
	LatencyMs     float64   `json:"latency_ms"`
	MosScore      float64   `json:"mos_score"` // 1.0 - 5.0 (ITU-T G.107 standard)
	SipOptionsRtt float64   `json:"sip_options_rtt_ms"`
	Status        string    `json:"status"` // "EXCELLENT", "GOOD", "DEGRADED"
	LastChecked   time.Time `json:"last_checked"`
}

type SnmpTrapEvent struct {
	ID         int       `json:"id"`
	SenderIP   string    `json:"sender_ip"`
	DeviceName string    `json:"device_name"`
	TrapOID    string    `json:"trap_oid"`
	TrapName   string    `json:"trap_name"`
	Severity   string    `json:"severity"`
	Message    string    `json:"message"`
	FiredAt    time.Time `json:"fired_at"`
}

type BgpPeerSession struct {
	PeerIP        string    `json:"peer_ip"`
	LocalIP       string    `json:"local_ip"`
	PeerAS        int       `json:"peer_as"`
	State         string    `json:"state"` // "Established", "Active", "Idle"
	UptimeHours   float64   `json:"uptime_hours"`
	PrefixesRx    int       `json:"prefixes_rx"`
	PrefixesTx    int       `json:"prefixes_tx"`
	ResetCount    int       `json:"reset_count"`
	LastFlapTime  time.Time `json:"last_flap_time"`
}

// HandleGetNetFlows handles GET /api/v1/network/flows
func HandleGetNetFlows(c *gin.Context) {
	now := time.Now()
	flows := []NetFlowRecord{
		{
			ID: 1, SrcIP: "172.168.1.11", DstIP: "172.168.1.1", SrcPort: 5432, DstPort: 49182,
			Protocol: "TCP", Application: "PostgreSQL Database Sync", BytesTrans: 842104000,
			Packets: 582100, DurationMs: 12400, Timestamp: now.Add(-1 * time.Minute),
		},
		{
			ID: 2, SrcIP: "172.168.1.51", DstIP: "172.168.1.1", SrcPort: 5060, DstPort: 5060,
			Protocol: "UDP", Application: "VoIP SIP Telephony", BytesTrans: 48920100,
			Packets: 241000, DurationMs: 38200, Timestamp: now.Add(-2 * time.Minute),
		},
		{
			ID: 3, SrcIP: "172.168.1.56", DstIP: "52.96.164.2", SrcPort: 443, DstPort: 58921,
			Protocol: "TCP", Application: "Microsoft Teams Video", BytesTrans: 412098000,
			Packets: 312000, DurationMs: 45000, Timestamp: now.Add(-3 * time.Minute),
		},
		{
			ID: 4, SrcIP: "172.168.1.17", DstIP: "172.168.1.18", SrcPort: 8080, DstPort: 41298,
			Protocol: "TCP", Application: "SAP ERP Financials", BytesTrans: 198200000,
			Packets: 142000, DurationMs: 8200, Timestamp: now.Add(-4 * time.Minute),
		},
		{
			ID: 5, SrcIP: "172.168.1.58", DstIP: "142.250.190.46", SrcPort: 443, DstPort: 51240,
			Protocol: "TCP", Application: "HTTPS Web Gateway", BytesTrans: 142098000,
			Packets: 98400, DurationMs: 6400, Timestamp: now.Add(-5 * time.Minute),
		},
	}

	c.JSON(http.StatusOK, gin.H{"flows": flows, "total": len(flows)})
}

// HandleGetVoipQuality handles GET /api/v1/network/voip
func HandleGetVoipQuality(c *gin.Context) {
	now := time.Now()
	voip := []VoipQualityRecord{
		{
			ID: 1, TrunkName: "Cisco-CUCM-Primary-Trunk", PBXServer: "172.168.1.10 (VoIP PBX)",
			Protocol: "SIP RFC 3261", JitterMs: 1.2, PacketLossPct: 0.01, LatencyMs: 8.4,
			MosScore: 4.41, SipOptionsRtt: 4.2, Status: "EXCELLENT", LastChecked: now,
		},
		{
			ID: 2, TrunkName: "Asterisk-Branch-Office-02", PBXServer: "172.168.1.71 (PBX Core)",
			Protocol: "SIP RFC 3261", JitterMs: 2.8, PacketLossPct: 0.04, LatencyMs: 14.8,
			MosScore: 4.28, SipOptionsRtt: 6.8, Status: "GOOD", LastChecked: now,
		},
	}

	c.JSON(http.StatusOK, gin.H{"voip_records": voip, "total": len(voip)})
}

// HandleGetSnmpTrapsAndBgp handles GET /api/v1/network/traps
func HandleGetSnmpTrapsAndBgp(c *gin.Context) {
	now := time.Now()
	traps := []SnmpTrapEvent{
		{
			ID: 1, SenderIP: "172.168.1.31", DeviceName: "dlink-sw-31",
			TrapOID: ".1.3.6.1.6.3.1.1.5.3 (linkDown)", TrapName: "IF-MIB::linkDown",
			Severity: "Warning", Message: "Interface GigabitEthernet 0/12 physical link disconnected",
			FiredAt: now.Add(-25 * time.Minute),
		},
		{
			ID: 2, SenderIP: "172.168.1.1", DeviceName: "gw-1 (Security Gateway)",
			TrapOID: ".1.3.6.1.4.1.9.9.41.1.2.3.1 (ciscoSyslogMIB)", TrapName: "CISCO::ConfigChange",
			Severity: "Info", Message: "SYS-5-CONFIG_I: Configured from console by deepak.sah",
			FiredAt: now.Add(-45 * time.Minute),
		},
	}

	bgp := []BgpPeerSession{
		{
			PeerIP: "172.168.1.1", LocalIP: "172.168.1.31", PeerAS: 65001,
			State: "Established", UptimeHours: 342.5, PrefixesRx: 184, PrefixesTx: 12,
			ResetCount: 0, LastFlapTime: now.Add(-342 * time.Hour),
		},
		{
			PeerIP: "192.0.2.1 (ISP Uplink)", LocalIP: "172.168.1.1", PeerAS: 15169,
			State: "Established", UptimeHours: 720.0, PrefixesRx: 890412, PrefixesTx: 4,
			ResetCount: 0, LastFlapTime: now.Add(-720 * time.Hour),
		},
	}

	c.JSON(http.StatusOK, gin.H{"traps": traps, "bgp_peers": bgp})
}

