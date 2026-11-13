package alerts

import (
	"fmt"
	"log"
	"v-nms/internal/database"
	"v-nms/internal/models"
)

// EvaluateDeviceRules checks device metrics against SLA rules
func EvaluateDeviceRules(d *models.Device, pingAlive bool, latency float64) {
	// Rule 1: Host Down Rule
	if !pingAlive {
		msg := fmt.Sprintf("CRITICAL: Device %s (%s) is DOWN! Ping unreachable.", d.Hostname, d.IPAddress)
		log.Println(msg)
		_ = database.InsertAlert(d.ID, "critical", "DeviceDown", msg)
	} else {
		// Device is reachable, resolve DeviceDown if active
		_ = database.ClearAlert(d.ID, "DeviceDown")
	}

	// Rule 2: High Latency Rule (> 100ms)
	if pingAlive && latency > 100.0 {
		msg := fmt.Sprintf("WARNING: Device %s (%s) high latency detected: %.1f ms", d.Hostname, d.IPAddress, latency)
		log.Println(msg)
		_ = database.InsertAlert(d.ID, "warning", "HighLatency", msg)
	} else if pingAlive && latency <= 100.0 {
		_ = database.ClearAlert(d.ID, "HighLatency")
	}
}