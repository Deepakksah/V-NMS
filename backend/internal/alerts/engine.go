package alerts

import (
	"fmt"
	"log"
	"sync"
	"v-nms/internal/database"
	"v-nms/internal/models"
)

// Flapping Protection & Recovery Hysteresis State (Feature 17.6.9)
// Require 3 consecutive successful polls before clearing DOWN alert
var (
	pollHysteresisMutex sync.Mutex
	consecutiveUpMap    = make(map[int]int)
	gatewayDownStatus   bool // Tracks if the subnet default gateway / firewall is down
)

// SetGatewayStatus updates the status of the primary subnet gateway
func SetGatewayStatus(alive bool) {
	pollHysteresisMutex.Lock()
	defer pollHysteresisMutex.Unlock()
	gatewayDownStatus = !alive
}

// EvaluateDeviceRules checks device metrics against SLA rules with PRTG-inspired
// Parent-Child Dependency Alarm Suppression (17.1.5) and Flapping Protection (17.6.9)
func EvaluateDeviceRules(d *models.Device, pingAlive bool, latency float64) {
	pollHysteresisMutex.Lock()
	defer pollHysteresisMutex.Unlock()

	isGateway := d.DeviceType == "firewall" || d.DeviceType == "gateway" || d.IPAddress == "172.168.1.1" || d.Hostname == "gw-1"
	if isGateway {
		gatewayDownStatus = !pingAlive
	}

	// 1. Host Status & Flapping Hysteresis Evaluation
	if !pingAlive {
		// Reset consecutive UP count immediately on any failure
		consecutiveUpMap[d.ID] = 0

		// Feature 17.1.5: Parent-Child Dependency Alarm Suppression
		// If an upstream gateway/firewall is DOWN, suppress downstream alarm storm
		if !isGateway && gatewayDownStatus {
			msg := fmt.Sprintf("DEPENDENCY SUPPRESSED: Device %s (%s) is unreachable because upstream Gateway/Firewall is DOWN.", d.Hostname, d.IPAddress)
			log.Printf("[NOC-SUPPRESSED] %s\n", msg)
			// Do not fire critical alert storm for downstream dependencies
			return
		}

		// Fire Root Cause Alert
		msg := fmt.Sprintf("CRITICAL: Device %s (%s) is DOWN! Ping unreachable.", d.Hostname, d.IPAddress)
		log.Println(msg)
		_ = database.InsertAlert(d.ID, "critical", "DeviceDown", msg)

	} else {
		// Device responded to ping; increment hysteresis counter
		consecutiveUpMap[d.ID]++
		upCount := consecutiveUpMap[d.ID]

		// Require 3 consecutive successful polls before clearing active DOWN alert
		const requiredConsecutivePings = 3
		if upCount >= requiredConsecutivePings {
			_ = database.ClearAlert(d.ID, "DeviceDown")
		} else {
			log.Printf("[NOC-HYSTERESIS] Device %s (%s) UP verification %d/%d; maintaining alarm state to prevent flapping.\n",
				d.Hostname, d.IPAddress, upCount, requiredConsecutivePings)
		}
	}

	// 2. High Latency Rule (> 100ms SLA breach)
	if pingAlive && latency > 100.0 {
		msg := fmt.Sprintf("WARNING: Device %s (%s) high latency detected: %.1f ms", d.Hostname, d.IPAddress, latency)
		log.Println(msg)
		_ = database.InsertAlert(d.ID, "warning", "HighLatency", msg)
	} else if pingAlive && latency <= 100.0 {
		_ = database.ClearAlert(d.ID, "HighLatency")
	}
}
