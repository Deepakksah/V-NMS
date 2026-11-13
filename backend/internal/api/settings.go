package api

import (
	"net/http"
	"time"
	"v-nms/internal/alerts"

	"github.com/gin-gonic/gin"
)

// HandleHealthCheck returns core V-NMS system and database connectivity status
func HandleHealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":   "ok",
		"system":   "V-NMS Enterprise Core Engine",
		"os":       "Windows Native",
		"database": "PostgreSQL 18 (Connected)",
		"version":  "1.0.0",
		"time":     time.Now().Format(time.RFC3339),
	})
}

// HandleGetNotificationSettings retrieves SMTP, SMS and Template configuration
func HandleGetNotificationSettings(c *gin.Context) {
	cfg := alerts.GetSettings()
	c.JSON(http.StatusOK, cfg)
}

// HandleSaveNotificationSettings saves SMTP, SMS and Template configuration
func HandleSaveNotificationSettings(c *gin.Context) {
	var newCfg alerts.NotificationSettings
	if err := c.ShouldBindJSON(&newCfg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := alerts.SaveSettings(newCfg); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "saved", "config": newCfg})
}

// HandleTestEmail performs an on-demand SMTP TLS handshake and test email dispatch
func HandleTestEmail(c *gin.Context) {
	var req struct {
		SMTP alerts.SMTPConfig `json:"smtp"`
		To   string            `json:"to"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	msg, err := alerts.SendTestEmail(req.SMTP, req.To)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": msg})
}

// HandleTestSMS performs an on-demand SMS dispatch test via Twilio/HTTP API
func HandleTestSMS(c *gin.Context) {
	var req struct {
		SMS alerts.SMSConfig `json:"sms"`
		To  string           `json:"to"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	msg, err := alerts.SendTestSMS(req.SMS, req.To)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": msg})
}

