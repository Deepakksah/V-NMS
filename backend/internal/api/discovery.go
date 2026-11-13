package api

import (
	"net/http"
	"v-nms/internal/database"
	"v-nms/internal/scanner"

	"github.com/gin-gonic/gin"
)

// HandleTriggerDiscoveryScan triggers a live asynchronous CIDR sweep across the local subnet
func HandleTriggerDiscoveryScan(c *gin.Context) {
	go func() {
		_, _ = scanner.RunNetworkDiscovery()
	}()
	c.JSON(http.StatusOK, gin.H{
		"status":  "started",
		"message": "Network discovery scan initiated across subnet 172.168.1.0/24",
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
