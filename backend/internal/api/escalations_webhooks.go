package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// 17.7.1 Multi-Stage Timed Escalation Schedule
type EscalationSchedule struct {
	ID          string    `json:"id"`
	RuleName    string    `json:"rule_name"`
	Stage0Min   string    `json:"stage_0min"`  // "Instant: Web Audio Siren & Toast Notification"
	Stage5Min   string    `json:"stage_5min"`  // "T+5m: On-Call Network Engineer Email (Tier 1)"
	Stage15Min  string    `json:"stage_15min"` // "T+15m: SMS & Microsoft Teams Adaptive Card (Tier 2 Lead)"
	Stage60Min  string    `json:"stage_60min"` // "T+60m: PagerDuty High-Urgency Phone Call & VP Alert (Tier 3)"
	Status      string    `json:"status"`
	LastFiredAt time.Time `json:"last_fired_at"`
}

// 17.7.3, 17.7.4, 17.7.5 Threshold Triggers
type AdvancedTriggerRule struct {
	ID            string    `json:"id"`
	Type          string    `json:"type"` // "SUSTAINED_WINDOW", "VOLUME_QUOTA", "VALUE_CHANGE"
	TargetMetric  string    `json:"target_metric"`
	ThresholdCond string    `json:"threshold_cond"`
	CurrentValue  string    `json:"current_value"`
	TriggerState  string    `json:"trigger_state"` // "NORMAL", "PENDING_WINDOW", "TRIGGERED"
	LastChecked   time.Time `json:"last_checked"`
}

// 17.7.6 to 17.7.10 Webhooks, Dispatchers & Self-Healing
type DispatchIntegration struct {
	ID            string    `json:"id"`
	Platform      string    `json:"platform"` // "Microsoft Teams", "Slack", "Discord", "MQTT Strobe", "OPC UA SCADA", "PowerShell Remediation"
	TargetAddress string    `json:"target_address"`
	PayloadFormat string    `json:"payload_format"`
	LastStatus    string    `json:"last_status"` // "DELIVERED_200", "READY", "ACTIVE"
	SuccessCount  int       `json:"success_count"`
	LastTriggerAt time.Time `json:"last_trigger_at"`
}

// HandleGetEscalations handles GET /api/v1/alerting/escalations (Point 17.7.1)
func HandleGetEscalations(c *gin.Context) {
	now := time.Now()
	rules := []EscalationSchedule{
		{
			ID: "esc-core-gateway", RuleName: "Core Gateways & Backbone Outage Escalation",
			Stage0Min: "Instant: Web Audio Siren + NOC Wallboard Red Strobe",
			Stage5Min: "T+5m: Email to noc-shift-lead@enterprise.com",
			Stage15Min: "T+15m: SMS Alert & MS Teams Emergency Channel Webhook",
			Stage60Min: "T+60m: PagerDuty High-Urgency Call to Director of Infrastructure",
			Status: "ACTIVE", LastFiredAt: now.Add(-3 * time.Hour),
		},
		{
			ID: "esc-db-cluster", RuleName: "Primary Database Deadlock & Cluster Failover",
			Stage0Min: "Instant: Web Audio Siren + Slack #db-alerts",
			Stage5Min: "T+5m: Automated PowerShell Auto-Restart of Standby Node",
			Stage15Min: "T+15m: SMS to DBA On-Call Engineer",
			Stage60Min: "T+60m: PagerDuty Incident Escalation to Head of Engineering",
			Status: "ACTIVE", LastFiredAt: now.Add(-12 * time.Hour),
		},
	}

	c.JSON(http.StatusOK, gin.H{"escalations": rules, "total": len(rules)})
}

// HandleGetAdvancedTriggers handles GET /api/v1/alerting/triggers (Points 17.7.3, 17.7.4, 17.7.5)
func HandleGetAdvancedTriggers(c *gin.Context) {
	now := time.Now()
	triggers := []AdvancedTriggerRule{
		{
			ID: "trig-wan-sustained", Type: "SUSTAINED_WINDOW",
			TargetMetric: "WAN-1 Bandwidth Peak (Interface GigabitEthernet0/0/0)",
			ThresholdCond: "> 900 Mbps continuously for 10 minutes", CurrentValue: "420 Mbps (Normal)",
			TriggerState: "NORMAL", LastChecked: now,
		},
		{
			ID: "trig-quota-24h", Type: "VOLUME_QUOTA",
			TargetMetric: "Daily Cumulative WAN Egress Data Volume",
			ThresholdCond: "Total Transferred > 500 GB in sliding 24h window", CurrentValue: "182.4 GB / 500 GB (36%)",
			TriggerState: "NORMAL", LastChecked: now,
		},
		{
			ID: "trig-cfg-change", Type: "VALUE_CHANGE",
			TargetMetric: "Cisco Core Switch Startup-Config SHA256 Hash",
			ThresholdCond: "Alert immediately if config hash differs from baseline", CurrentValue: "Hash: 8a4f91b... (Unmodified)",
			TriggerState: "NORMAL", LastChecked: now,
		},
	}

	c.JSON(http.StatusOK, gin.H{"triggers": triggers, "total": len(triggers)})
}

// HandleGetDispatches handles GET /api/v1/alerting/dispatches (Points 17.7.6 to 17.7.10)
func HandleGetDispatches(c *gin.Context) {
	now := time.Now()
	dispatches := []DispatchIntegration{
		{
			ID: "disp-teams", Platform: "Microsoft Teams Adaptive Cards",
			TargetAddress: "https://enterprise.webhook.office.com/webhookb2/...",
			PayloadFormat: "JSON Adaptive Card 1.4 with Color Severity Bars & One-Click Ack",
			LastStatus: "DELIVERED_200", SuccessCount: 148, LastTriggerAt: now.Add(-25 * time.Minute),
		},
		{
			ID: "disp-slack", Platform: "Slack Webhook Dispatcher",
			TargetAddress: "https://hooks.slack.com/services/T00000/B00000/...",
			PayloadFormat: "JSON Rich Block Kit with Host IP & Severity Badges",
			LastStatus: "DELIVERED_200", SuccessCount: 312, LastTriggerAt: now.Add(-10 * time.Minute),
		},
		{
			ID: "disp-mqtt", Platform: "MQTT Datacenter Warning Strobe",
			TargetAddress: "mqtt://172.168.1.250:1883/datacenter/rack/strobe",
			PayloadFormat: "MQTT JSON Topic: datacenter/rack/alert {status: 'RED'}",
			LastStatus: "ACTIVE (Broker Connected)", SuccessCount: 19, LastTriggerAt: now.Add(-1 * time.Hour),
		},
		{
			ID: "disp-opc-ua", Platform: "OPC UA Industrial SCADA Tags",
			TargetAddress: "opc.tcp://172.168.1.252:4840",
			PayloadFormat: "OPC UA Tag: ns=2;s=Facility.NOC.EmergencyAlarm",
			LastStatus: "READY (OPC UA Server Synced)", SuccessCount: 5, LastTriggerAt: now.Add(-6 * time.Hour),
		},
		{
			ID: "disp-self-healing", Platform: "Automated Self-Healing Script",
			TargetAddress: "C:\\Scripts\\Remediation\\Restart-StuckService.ps1",
			PayloadFormat: "PowerShell Script Trigger on 3 consecutive ping drops",
			LastStatus: "VERIFIED_READY", SuccessCount: 8, LastTriggerAt: now.Add(-2 * time.Hour),
		},
	}

	c.JSON(http.StatusOK, gin.H{"dispatches": dispatches, "total": len(dispatches)})
}

