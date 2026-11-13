package api

import (
	"net/http"
	"strconv"
	"time"
	"v-nms/internal/alerts"
	"v-nms/internal/database"
	"v-nms/internal/models"
	"v-nms/internal/ping"
	"v-nms/internal/poller"

	"github.com/gin-gonic/gin"
)

// HandleGetAllDevices fetches all discovered and registered network infrastructure devices
func HandleGetAllDevices(c *gin.Context) {
	devices, err := database.GetAllDevices()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"devices": devices, "total": len(devices)})
}

// HandleAddDevice persists a new device node with ping validation and catalog defaults
func HandleAddDevice(c *gin.Context) {
	var dev models.Device
	if err := c.ShouldBindJSON(&dev); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Fast probe ping
	pRes := ping.FastPing(dev.IPAddress, 800*time.Millisecond)
	dev.Status = pRes.Alive
	dev.LastPingMs = pRes.LatencyMs
	if dev.Status && dev.LastPingMs <= 0 {
		dev.LastPingMs = 0.5
	}

	if dev.DeviceType == "" {
		dev.DeviceType = "server"
	}
	if dev.Vendor == "" {
		switch dev.DeviceType {
		case "switch":
			dev.Vendor = "Cisco"
			if dev.Hardware == "" {
				dev.Hardware = "Cisco Catalyst 9300-48P PoE+"
			}
		case "firewall":
			dev.Vendor = "Check Point"
			if dev.Hardware == "" {
				dev.Hardware = "Check Point Quantum 1800 Next-Gen Firewall"
			}
		case "workstation":
			dev.Vendor = "HP"
			if dev.Hardware == "" {
				dev.Hardware = "HP EliteDesk 800 G8 Workstation"
			}
		case "ntp":
			dev.Vendor = "Microchip"
			if dev.Hardware == "" {
				dev.Hardware = "Microchip SyncServer S650 NTP/PTP Time Server"
			}
		default:
			dev.Vendor = "Dell"
			if dev.Hardware == "" {
				dev.Hardware = "Dell PowerEdge R750 Enterprise Server"
			}
		}
	}

	if err := database.InsertDevice(&dev); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, dev)
}

// HandleGetDevicePorts retrieves ports discovered for a specific device
func HandleGetDevicePorts(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	ports, err := database.GetDevicePorts(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ports": ports, "total": len(ports)})
}

// HandlePingDevice runs a live on-demand ICMP ping and logs telemetry metric
func HandlePingDevice(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	devices, _ := database.GetAllDevices()
	var target *models.Device
	for i := range devices {
		if devices[i].ID == id {
			target = &devices[i]
			break
		}
	}

	if target == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device not found"})
		return
	}

	res := ping.FastPing(target.IPAddress, 2*time.Second)
	alerts.EvaluateDeviceRules(target, res.Alive, res.LatencyMs)
	_ = database.UpdateDeviceStatus(target.ID, res.Alive, res.LatencyMs, target.UptimeSeconds, target.SysDescr, target.SysName)
	_ = database.InsertMetric(target.ID, "ping", res.LatencyMs, 0)

	c.JSON(http.StatusOK, gin.H{
		"hostname":   target.Hostname,
		"ip":         target.IPAddress,
		"alive":      res.Alive,
		"latency_ms": res.LatencyMs,
	})
}

// HandlePollDevice runs an on-demand SNMP/WMI poller sweep for a device
func HandlePollDevice(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	devices, _ := database.GetAllDevices()
	var target *models.Device
	for i := range devices {
		if devices[i].ID == id {
			target = &devices[i]
			break
		}
	}

	if target == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device not found"})
		return
	}

	p := poller.NewDevicePoller(target)
	err := p.PollCoreInfo()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"polled": false,
			"error":  err.Error(),
			"device": target,
		})
		return
	}

	_ = database.UpdateDeviceStatus(target.ID, true, target.LastPingMs, target.UptimeSeconds, target.SysDescr, target.SysName)

	c.JSON(http.StatusOK, gin.H{
		"polled": true,
		"device": target,
	})
}

// HandleGetDeviceMetrics returns metric timeseries history from PostgreSQL
func HandleGetDeviceMetrics(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	metricType := c.DefaultQuery("type", "ping")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	points, err := database.GetRecentMetrics(id, metricType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"metrics": points})
}

