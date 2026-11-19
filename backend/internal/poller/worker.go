package poller

import (
	"log"
	"time"
	"v-nms/internal/alerts"
	"v-nms/internal/database"
	"v-nms/internal/models"
	"v-nms/internal/ping"
)

// StartBackgroundPoller runs continuous polling routines across all registered devices
func StartBackgroundPoller(interval time.Duration) {
	ticker := time.NewTicker(interval)

	pollAll := func() {
		devices, err := database.GetAllDevices()
		if err != nil {
			log.Println("Background poller failed to query devices:", err)
			return
		}

		for i := range devices {
			dev := devices[i]
			// Concurrent goroutine per device (High concurrency)
			go func(d models.Device) {
				// 1. Fast Ping
				res := ping.FastPing(d.IPAddress, 2*time.Second)

				// 2. Evaluate Alert Rules (Milestone 5)
				alerts.EvaluateDeviceRules(&d, res.Alive, res.LatencyMs)

				// 3. SNMP Poll if alive
				uptime := d.UptimeSeconds
				sysDescr := d.SysDescr
				sysName := d.SysName

				if res.Alive {
					p := NewDevicePoller(&d)
					if err := p.PollCoreInfo(); err == nil {
						uptime = d.UptimeSeconds
						sysDescr = d.SysDescr
						sysName = d.SysName
					}
					// Walk IF-MIB Interface Table
					if ports, err := p.PollInterfaces(); err == nil && len(ports) > 0 {
						_ = database.UpsertPorts(d.ID, ports)
					}
				}

				_ = database.UpdateDeviceStatus(d.ID, res.Alive, res.LatencyMs, uptime, sysDescr, sysName)
				_ = database.InsertMetric(d.ID, "ping", res.LatencyMs, 0)
			}(dev)
		}
	}

	go func() {
		pollAll() // Immediate first poll
		for range ticker.C {
			pollAll()
		}
	}()
	log.Println("Autonomous Background Poller with Alerting started with interval:", interval)
}