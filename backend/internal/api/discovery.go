package api

import (
	"fmt"
	"net/http"
	"strings"
	"v-nms/internal/database"
	"v-nms/internal/scanner"

	"github.com/gin-gonic/gin"
)

type DiscoveryScanRequest struct {
	Subnet string `json:"subnet"`
}

// HandleTriggerDiscoveryScan triggers a live asynchronous CIDR sweep across the target or detected subnet
func HandleTriggerDiscoveryScan(c *gin.Context) {
	var req DiscoveryScanRequest
	_ = c.ShouldBindJSON(&req)

	targetSubnet := strings.TrimSpace(req.Subnet)
	if targetSubnet == "" {
		detected, _ := scanner.DetectLocalSubnet()
		targetSubnet = detected
	}

	go func(sub string) {
		_, _ = scanner.RunNetworkDiscovery(sub)
	}(targetSubnet)

	c.JSON(http.StatusOK, gin.H{
		"status":  "started",
		"subnet":  targetSubnet,
		"message": fmt.Sprintf("Live network discovery scan initiated across subnet %s", targetSubnet),
	})
}

// HandleGetDetectedSubnet returns the machine's primary live subnet and host IP
func HandleGetDetectedSubnet(c *gin.Context) {
	subnet, hostIP := scanner.DetectLocalSubnet()
	c.JSON(http.StatusOK, gin.H{
		"subnet":  subnet,
		"host_ip": hostIP,
	})
}

// HandleGetDiscoveryStatus retrieves current scanner metrics and progress
func HandleGetDiscoveryStatus(c *gin.Context) {
	c.JSON(http.StatusOK, scanner.GetStatus())
}

// HandleClearAllDevices deletes all devices and metrics from PostgreSQL
func HandleClearAllDevices(c *gin.Context) {
	if err := database.ClearAllDevices(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  "cleared",
		"message": "All devices and telemetry have been cleared from database. Inventory is now empty.",
	})
}
