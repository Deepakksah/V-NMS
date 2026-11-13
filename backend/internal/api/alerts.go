package api

import (
	"net/http"
	"strconv"
	"v-nms/internal/database"

	"github.com/gin-gonic/gin"
)

// HandleGetAllAlerts retrieves all active and recorded incidents from PostgreSQL
func HandleGetAllAlerts(c *gin.Context) {
	list, err := database.GetActiveAlerts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"alerts": list, "total": len(list)})
}

// HandleAcknowledgeAlert marks an active alert as acknowledged
func HandleAcknowledgeAlert(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := database.AcknowledgeAlert(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "acknowledged", "id": id})
}

// HandleResolveAlert clears and resolves an alert incident in PostgreSQL
func HandleResolveAlert(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := database.ResolveAlertByID(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "cleared", "id": id})
}

// HandleSimulateAlert injects a synthetic incident into PostgreSQL for NOC validation
func HandleSimulateAlert(c *gin.Context) {
	var req struct {
		DeviceID int    `json:"device_id"`
		Type     string `json:"type"` // "down", "storage", "latency", "cpu", "memory"
		RuleName string `json:"rule_name"`
		Message  string `json:"message"`
		Severity string `json:"severity"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.DeviceID == 0 {
		req.DeviceID = 1
	}
	if req.Severity == "" {
		req.Severity = "critical"
	}
	if req.RuleName == "" {
		req.RuleName = "SimulatedAlert"
	}
	if req.Message == "" {
		req.Message = "Test alert incident triggered via NOC console."
	}
	_ = database.InsertAlert(req.DeviceID, req.Severity, req.RuleName, req.Message)
	c.JSON(http.StatusOK, gin.H{"status": "triggered", "rule": req.RuleName, "severity": req.Severity})
}

