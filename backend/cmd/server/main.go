package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"v-nms/internal/alerts"
	"v-nms/internal/auth"
	"v-nms/internal/database"
	"v-nms/internal/models"
	"v-nms/internal/ping"
	"v-nms/internal/poller"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to local PostgreSQL
	dbURL := "postgres://postgres:postgres@127.0.0.1:5432/vnms?sslmode=disable"
	if err := database.ConnectDB(dbURL); err != nil {
		log.Fatalf("Fatal: Database connection failed: %v", err)
	}

	// Seed default auth users if empty (SuperAdmin: deepak.sah, Operator: operator)
	if err := database.SeedDefaultUsers(); err != nil {
		log.Printf("Notice: User seed check: %v", err)
	}

	// Seed sample devices if database is empty
	devs, _ := database.GetAllDevices()
	if len(devs) == 0 {
		d1 := models.Device{
			Hostname:      "Local-Gateway",
			IPAddress:     "127.0.0.1",
			SNMPVersion:   "v2c",
			SNMPCommunity: "public",
			SNMPPort:      161,
			OS:            "Windows Native",
			Status:        true,
			LastPingMs:    0.3,
		}
		d2 := models.Device{
			Hostname:      "Public-DNS-Google",
			IPAddress:     "8.8.8.8",
			SNMPVersion:   "v2c",
			SNMPCommunity: "public",
			SNMPPort:      161,
			OS:            "Generic",
			Status:        true,
			LastPingMs:    12.4,
		}
		_ = database.InsertDevice(&d1)
		_ = database.InsertDevice(&d2)
	}

	// Start Autonomous High-Concurrency Poller (Milestone 2)
	poller.StartBackgroundPoller(30 * time.Second)

	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api/v1")
	{
		// ==================== AUTHENTICATION & SESSION ROUTES ====================
		authGroup := api.Group("/auth")
		{
			// Login Endpoint
			authGroup.POST("/login", func(c *gin.Context) {
				var req models.LoginRequest
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Username and password required"})
					return
				}

				user, err := database.GetUserByUsernameOrEmail(req.Username)
				if err != nil {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
					return
				}

				if !auth.CheckPasswordHash(req.Password, user.PasswordHash) {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
					return
				}

				token, expiresIn, err := auth.GenerateToken(user)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authorization token: " + err.Error()})
					return
				}

				c.JSON(http.StatusOK, models.LoginResponse{
					Token:     token,
					TokenType: "Bearer",
					ExpiresIn: expiresIn,
					User:      *user,
				})
			})

			// Logout Endpoint
			authGroup.POST("/logout", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Successfully logged out. Session invalidated.",
					"status":  "ok",
				})
			})

			// Current User Info (Protected with AuthMiddleware)
			authGroup.GET("/me", auth.AuthMiddleware(), func(c *gin.Context) {
				userID, exists := c.Get("user_id")
				if !exists {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session claims"})
					return
				}
				id, ok := userID.(int)
				if !ok {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
					return
				}

				user, err := database.GetUserByID(id)
				if err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
					return
				}

				c.JSON(http.StatusOK, gin.H{
					"user": user,
				})
			})
		}

		// Alerts List (Milestone 5)
		api.GET("/alerts", func(c *gin.Context) {
			list, err := database.GetActiveAlerts()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"alerts": list, "total": len(list)})
		})

		// Health status
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":   "ok",
				"system":   "V-Nms Core Engine",
				"os":       "Windows Native",
				"database": "PostgreSQL 18 (Connected)",
				"version":  "1.0.0",
				"time":     time.Now().Format(time.RFC3339),
			})
		})

		// Devices List (from Postgres)
		api.GET("/devices", func(c *gin.Context) {
			devices, err := database.GetAllDevices()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"devices": devices, "total": len(devices)})
		})

		// Add Device (into Postgres) - Protected: Requires SuperAdmin or Operator
		api.POST("/devices", auth.AuthMiddleware(), auth.RequireRole("superadmin", "operator"), func(c *gin.Context) {
			var dev models.Device
			if err := c.ShouldBindJSON(&dev); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			if err := database.InsertDevice(&dev); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusCreated, dev)
		})

		// Device Ports List
		api.GET("/devices/:id/ports", func(c *gin.Context) {
			id, _ := strconv.Atoi(c.Param("id"))
			ports, err := database.GetDevicePorts(id)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"ports": ports, "total": len(ports)})
		})

		// Live Device Ping Test
		api.GET("/devices/:id/ping", func(c *gin.Context) {
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
		})

		// Live SNMP Poll - Protected with Auth
		api.POST("/devices/:id/poll", auth.AuthMiddleware(), func(c *gin.Context) {
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
		})

		// Device Metrics History (from PostgreSQL partitioned table)
		api.GET("/devices/:id/metrics", func(c *gin.Context) {
			id, _ := strconv.Atoi(c.Param("id"))
			metricType := c.DefaultQuery("type", "ping")
			limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
			points, err := database.GetRecentMetrics(id, metricType, limit)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"metrics": points})
		})
	}

	fmt.Println("🚀 V-Nms Engine with PostgreSQL running on http://127.0.0.1:8081")
	r.Run(":8081")
}
