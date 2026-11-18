package api

import (
	"v-nms/internal/auth"
	"v-nms/internal/web"

	"github.com/gin-gonic/gin"
)

// SetupRouter initializes Gin, attaches CORS middleware, and registers all domain routes grouped by Nav section
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Global CORS Middleware
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
		// 1. System Health & Core Status
		api.GET("/health", HandleHealthCheck)

		// 2. Authentication & Session Domain
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/login", HandleLogin)
			authGroup.POST("/register", HandleRegister)
			authGroup.POST("/logout", HandleLogout)
			authGroup.GET("/me", auth.AuthMiddleware(), HandleGetMe)
			authGroup.POST("/forgot-password/request", HandleForgotPasswordRequest)
			authGroup.POST("/forgot-password/verify", HandleForgotPasswordVerifyAndReset)
			authGroup.POST("/change-password", auth.AuthMiddleware(), HandleChangePassword)
			authGroup.POST("/change-password/request-otp", auth.AuthMiddleware(), HandleRequestChangePasswordOTP)
		}

		// 3. User Accounts & RBAC Domain
		api.GET("/users", HandleGetAllUsers)
		api.POST("/users", HandleCreateUser)
		api.PUT("/users/:id", HandleUpdateUser)
		api.DELETE("/users/:id", HandleDeleteUser)

		// 4. Inventory Domain (Devices, Servers, Switches, Ports, Metrics, Storage)
		api.GET("/devices", HandleGetAllDevices)
		api.POST("/devices", HandleAddDevice)
		api.GET("/devices/:id/ports", HandleGetDevicePorts)
		api.GET("/devices/:id/ping", HandlePingDevice)
		api.POST("/devices/:id/poll", auth.AuthMiddleware(), HandlePollDevice)
		api.GET("/devices/:id/metrics", HandleGetDeviceMetrics)
		api.GET("/storage", HandleGetAllStorage)
		api.GET("/disks", HandleGetAllPhysicalDisks)

		// 5. Faults & Incidents Domain (Alerts, Trigger simulation)
		api.GET("/alerts", HandleGetAllAlerts)
		api.POST("/alerts/:id/acknowledge", HandleAcknowledgeAlert)
		api.POST("/alerts/:id/resolve", HandleResolveAlert)
		api.POST("/alerts/simulate", HandleSimulateAlert)

		// 6. Personnel, Alert Contacts & Routing Matrix Domain
		api.GET("/notifications/recipients", HandleGetAllRecipients)
		api.POST("/notifications/recipients", HandleCreateRecipient)
		api.DELETE("/notifications/recipients/:id", HandleDeleteRecipient)
		api.GET("/notifications/recipients/:id/subscriptions", HandleGetRecipientSubscriptions)
		api.POST("/notifications/recipients/:id/subscriptions", HandleSaveRecipientSubscriptions)

		// 7. Notification Gateways & System Settings Domain
		api.GET("/settings/notifications", HandleGetNotificationSettings)
		api.POST("/settings/notifications", HandleSaveNotificationSettings)
		api.POST("/notifications/email/test", HandleTestEmail)
		api.POST("/notifications/sms/test", HandleTestSMS)

		// 8. Network Discovery & Subnet Scanner Domain
		api.GET("/discovery/subnet", HandleGetDetectedSubnet)
		api.POST("/discovery/scan", HandleTriggerDiscoveryScan)
		api.GET("/discovery/status", HandleGetDiscoveryStatus)
		api.POST("/devices/clear", HandleClearAllDevices)
		api.DELETE("/devices/clear", HandleClearAllDevices)

		// 9. Virtualization, Docker Containers, K8s & Cloud Domain (PRTG Section 17.4)
		api.GET("/virtualization/containers", HandleGetContainersAndK8s)
		api.GET("/virtualization/cloud", HandleGetCloudTelemetry)
		api.GET("/virtualization/security", HandleGetCertificatesAndDNSBL)
		api.GET("/virtualization/hypervisors", HandleGetHypervisors)

		// 10. Deep Flow, NetFlow, VoIP MOS & SNMP Traps Domain (PRTG Section 17.2)
		api.GET("/network/flows", HandleGetNetFlows)
		api.GET("/network/voip", HandleGetVoipQuality)
		api.GET("/network/traps", HandleGetSnmpTrapsAndBgp)

		// 11. Server Hardware BMC, IPMI, Daemons & Patching Domain (PRTG Section 17.3)
		api.GET("/hardware/ipmi", HandleGetIpmiBmc)
		api.GET("/hardware/daemons", HandleGetServiceDaemons)
		api.GET("/hardware/ad-updates", HandleGetPatchAndAD)
		api.GET("/hardware/smart-disks", HandleGetSmartDisks)
		api.GET("/hardware/event-logs", HandleGetEventLogs)
		api.GET("/hardware/spoolers", HandleGetPrintSpoolers)

		// 12. Enterprise Applications, Databases & Storage Fabric (PRTG Section 17.5)
		api.GET("/apps/databases", HandleGetDatabaseTelemetry)
		api.GET("/apps/storage-fabric", HandleGetStorageFabric)
		api.GET("/apps/synthetics", HandleGetAppSynthetics)

		// 13. Synthetic Transactions, Web Journeys & SLAs (PRTG Section 17.6)
		api.GET("/synthetics/web", HandleGetSyntheticsWeb)
		api.GET("/synthetics/specialized", HandleGetSyntheticsSpecialized)

		// 14. Advanced Alerting, Escalations & Webhooks (PRTG Section 17.7)
		api.GET("/alerting/escalations", HandleGetEscalations)
		api.GET("/alerting/triggers", HandleGetAdvancedTriggers)
		api.GET("/alerting/dispatches", HandleGetDispatches)

		// 15. Analytics, SLA Penalties & Capacity Forecasting (PRTG Section 17.9)
		api.GET("/analytics/capacity", HandleGetCapacityForecast)
		api.GET("/analytics/sla-penalties", HandleGetSlaCompliance)
		api.GET("/analytics/root-cause", HandleGetAiRootCause)

		// 16. Probe Infrastructure, Maintenance Windows & Extensibility (PRTG Sections 17.1 & 17.10)
		api.GET("/system/probe-cluster", HandleGetProbeCluster)
		api.GET("/system/maintenance", HandleGetMaintenanceWindows)
		api.GET("/system/extensibility", HandleGetExtensibility)
	}

	// 17. Static Web SPA routes for embedded frontend
	web.RegisterWebRoutes(r)

	return r
}

