package api

import (
	"fmt"
	"net/http"
	"strconv"
	"v-nms/internal/database"
	"v-nms/internal/models"

	"github.com/gin-gonic/gin"
)

// HandleGetAllRecipients lists all alert contact persons from PostgreSQL
func HandleGetAllRecipients(c *gin.Context) {
	recipients, err := database.GetAllAlertRecipients()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"recipients": recipients, "total": len(recipients)})
}

// HandleCreateRecipient inserts a new alert contact into PostgreSQL
func HandleCreateRecipient(c *gin.Context) {
	var req models.AlertRecipient
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name, email and phone are required."})
		return
	}
	if req.OnCallStatus == "" {
		req.OnCallStatus = "active"
	}
	if err := database.CreateAlertRecipient(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"recipient": req, "status": "created"})
}

// HandleDeleteRecipient deletes an alert contact from PostgreSQL
func HandleDeleteRecipient(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := database.DeleteAlertRecipient(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "deleted", "id": id})
}

// HandleGetRecipientSubscriptions fetches the device notification routing matrix for a person
func HandleGetRecipientSubscriptions(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	rules, err := database.GetRecipientSubscriptions(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"subscriptions": rules, "total": len(rules)})
}

// HandleSaveRecipientSubscriptions persists per-device notification routing checkboxes
func HandleSaveRecipientSubscriptions(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req struct {
		Rules         []models.RecipientDeviceRule `json:"rules"`
		Subscriptions []models.RecipientDeviceRule `json:"subscriptions"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	items := req.Subscriptions
	if len(items) == 0 {
		items = req.Rules
	}
	if err := database.SaveRecipientSubscriptions(id, items); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":       "saved",
		"recipient_id": id,
		"count":        len(items),
		"message":      fmt.Sprintf("Saved %d device notification rules in PostgreSQL", len(items)),
	})
}

