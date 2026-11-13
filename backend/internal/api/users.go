package api

import (
	"net/http"
	"strconv"
	"v-nms/internal/auth"
	"v-nms/internal/database"
	"v-nms/internal/models"

	"github.com/gin-gonic/gin"
)

// HandleGetAllUsers fetches all system user accounts from PostgreSQL
func HandleGetAllUsers(c *gin.Context) {
	users, err := database.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": users, "total": len(users)})
}

// HandleCreateUser handles manual user provisioning with password hashing
func HandleCreateUser(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username, email and password required."})
		return
	}
	if len(req.Password) < 12 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Mandatory Security Policy: Password must be at least 12 characters long."})
		return
	}
	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Hashing failed: " + err.Error()})
		return
	}
	role := req.Role
	if role == "" {
		role = "operator"
	}
	newUser := models.User{
		Username:     req.Username,
		Email:        req.Email,
		FullName:     req.FullName,
		Phone:        req.Phone,
		Department:   req.Department,
		PasswordHash: hash,
		Role:         role,
	}
	if err := database.CreateUser(&newUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"user": newUser, "status": "created"})
}

// HandleDeleteUser deletes a non-superadmin user account
func HandleDeleteUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if id == 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete primary SuperAdmin account."})
		return
	}
	if err := database.DeleteUser(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "deleted", "id": id})
}

// HandleUpdateUser updates email, phone, full_name, department, role
func HandleUpdateUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req struct {
		Email      string `json:"email"`
		Phone      string `json:"phone"`
		FullName   string `json:"full_name"`
		Department string `json:"department"`
		Role       string `json:"role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if err := database.UpdateUserProfile(id, req.Email, req.Phone, req.FullName, req.Department, req.Role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "updated", "id": id})
}

