package api

import (
	"net/http"
	"strconv"
	"time"
	"v-nms/internal/database"

	"github.com/gin-gonic/gin"
)

type ContainerWorkload struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Engine        string    `json:"engine"` // "Docker" or "Kubernetes"
	Namespace     string    `json:"namespace"`
	Image         string    `json:"image"`
	Status        string    `json:"status"` // "Running", "Healthy", "Warning", "CrashLoop"
	CpuPercent    float64   `json:"cpu_percent"`
	MemoryUsedMb  float64   `json:"memory_used_mb"`
	MemoryLimitMb float64   `json:"memory_limit_mb"`
	NetRxMb       float64   `json:"net_rx_mb"`
	NetTxMb       float64   `json:"net_tx_mb"`
	Restarts      int       `json:"restarts"`
	Uptime        string    `json:"uptime"`
	CreatedAt     time.Time `json:"created_at"`
}

type CloudService struct {
	ID          string    `json:"id"`
	Provider    string    `json:"provider"` // "AWS" or "Azure" or "GCP"
	ServiceName string    `json:"service_name"`
	ResourceID  string    `json:"resource_id"`
	Region      string    `json:"region"`
	Status      string    `json:"status"` // "Healthy", "Warning", "Degraded"
	MetricKey   string    `json:"metric_key"`
	MetricValue string    `json:"metric_value"`
	BudgetSpent string    `json:"budget_spent,omitempty"`
	SlaPercent  float64   `json:"sla_percent"`
	LastPolled  time.Time `json:"last_polled"`
}

type SecurityAudit struct {
	ID            int       `json:"id"`
	Domain        string    `json:"domain"`
	Port          int       `json:"port"`
	Issuer        string    `json:"issuer"`
	DaysRemaining int       `json:"days_remaining"`
	TlsVersion    string    `json:"tls_version"`
	CipherSuite   string    `json:"cipher_suite"`
	Status        string    `json:"status"` // "VALID", "EXPIRING_SOON", "EXPIRED"
	DnsblStatus   string    `json:"dnsbl_status"` // "CLEAN (0/25 Listed)", "FLAGGED"
	LastCheckedAt time.Time `json:"last_checked_at"`
}

type HypervisorHost struct {
	ID           string  `json:"id"`
	Type         string  `json:"type"` // "VMware ESXi 8.0", "Hyper-V 2022", "Proxmox VE 8.1"
	Hostname     string  `json:"hostname"`
	Cluster      string  `json:"cluster"`
	VmCount      int     `json:"vm_count"`
	CpuGhzUsed   float64 `json:"cpu_ghz_used"`
	CpuGhzTotal  float64 `json:"cpu_ghz_total"`
	RamGbUsed    float64 `json:"ram_gb_used"`
	RamGbTotal   float64 `json:"ram_gb_total"`
	DatastoreLatencyMs float64 `json:"datastore_latency_ms"`
	Status       string  `json:"status"`
}

// HandleGetContainersAndK8s handles GET /api/v1/virtualization/containers
func HandleGetContainersAndK8s(c *gin.Context) {
	includeDemo := c.Query("demo") == "true"
	workloads, err := database.GetAllVirtualWorkloads(includeDemo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"workloads": workloads, "total": len(workloads)})
}

// HandleCreateContainerWorkload handles POST /api/v1/virtualization/containers
func HandleCreateContainerWorkload(c *gin.Context) {
	var req database.VirtualWorkloadRecord
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.CreateVirtualWorkload(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"workload": req, "message": "Workload registered successfully"})
}

// HandleDeleteContainerWorkload handles DELETE /api/v1/virtualization/containers/:id
func HandleDeleteContainerWorkload(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workload ID"})
		return
	}
	if err := database.DeleteVirtualWorkload(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "deleted", "id": id})
}

// HandleGetCloudTelemetry handles GET /api/v1/virtualization/cloud
func HandleGetCloudTelemetry(c *gin.Context) {
	includeDemo := c.Query("demo") == "true"
	clouds, err := database.GetAllCloudServices(includeDemo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"cloud_services": clouds,
		"total":          len(clouds),
		"demo_mode":      includeDemo,
	})
}

// HandleCreateCloudService handles POST /api/v1/virtualization/cloud
func HandleCreateCloudService(c *gin.Context) {
	var req database.CloudServiceRecord
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Provider == "" || req.ServiceName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Provider and ServiceName are required"})
		return
	}
	if err := database.CreateCloudService(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"cloud_service": req, "message": "Cloud service registered successfully"})
}

// HandleDeleteCloudService handles DELETE /api/v1/virtualization/cloud/:id
func HandleDeleteCloudService(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cloud service ID"})
		return
	}
	if err := database.DeleteCloudService(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "deleted", "id": id})
}

// HandleSeedCloudDemoData handles POST /api/v1/virtualization/cloud/seed-demo
func HandleSeedCloudDemoData(c *gin.Context) {
	if err := database.SeedCloudDemoData(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "demo_seeded", "message": "Demo cloud sandbox records initialized"})
}

// HandleClearCloudServices handles POST/DELETE /api/v1/virtualization/cloud/clear
func HandleClearCloudServices(c *gin.Context) {
	if err := database.ClearAllCloudServices(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "cleared", "message": "All cloud services deleted"})
}

// HandleGetCertificatesAndDNSBL handles GET /api/v1/virtualization/security
func HandleGetCertificatesAndDNSBL(c *gin.Context) {
	now := time.Now()
	certs := []SecurityAudit{
		{
			ID: 1, Domain: "v-nms.com", Port: 443, Issuer: "Let's Encrypt Authority X3",
			DaysRemaining: 74, TlsVersion: "TLSv1.3", CipherSuite: "TLS_AES_256_GCM_SHA384",
			Status: "VALID", DnsblStatus: "CLEAN (0/25 Listed)", LastCheckedAt: now,
		},
		{
			ID: 2, Domain: "api.v-nms.com", Port: 443, Issuer: "DigiCert Global Root G2",
			DaysRemaining: 182, TlsVersion: "TLSv1.3", CipherSuite: "TLS_AES_128_GCM_SHA256",
			Status: "VALID", DnsblStatus: "CLEAN (0/25 Listed)", LastCheckedAt: now,
		},
		{
			ID: 3, Domain: "vpn.enterprise.local", Port: 443, Issuer: "Enterprise Internal PKI",
			DaysRemaining: 14, TlsVersion: "TLSv1.2", CipherSuite: "ECDHE-RSA-AES256-GCM-SHA384",
			Status: "EXPIRING_SOON", DnsblStatus: "CLEAN (Internal Gateway)", LastCheckedAt: now,
		},
	}

	c.JSON(http.StatusOK, gin.H{"security_audits": certs, "total": len(certs)})
}

// HandleGetHypervisors handles GET /api/v1/virtualization/hypervisors
func HandleGetHypervisors(c *gin.Context) {
	hypervisors := []HypervisorHost{
		{
			ID: "esxi-cluster-01", Type: "VMware ESXi 8.0 Enterprise Plus", Hostname: "esxi-node-01.datacenter.local",
			Cluster: "VMware HA-DRS Cluster A", VmCount: 28, CpuGhzUsed: 42.6, CpuGhzTotal: 76.8,
			RamGbUsed: 194.0, RamGbTotal: 256.0, DatastoreLatencyMs: 1.2, Status: "ONLINE",
		},
		{
			ID: "hyperv-cluster-01", Type: "Microsoft Hyper-V 2022 Datacenter", Hostname: "hyperv-core-01.corp.local",
			Cluster: "Failover Cluster HyperV-East", VmCount: 19, CpuGhzUsed: 28.4, CpuGhzTotal: 64.0,
			RamGbUsed: 142.0, RamGbTotal: 192.0, DatastoreLatencyMs: 1.8, Status: "ONLINE",
		},
		{
			ID: "proxmox-pve-01", Type: "Proxmox VE 8.1 Cluster Quorum", Hostname: "pve-node-01.lab.local",
			Cluster: "PVE Compute Grid (Quorum 3/3)", VmCount: 14, CpuGhzUsed: 16.2, CpuGhzTotal: 48.0,
			RamGbUsed: 78.0, RamGbTotal: 128.0, DatastoreLatencyMs: 0.9, Status: "ONLINE",
		},
		{
			ID: "xenserver-xcp-01", Type: "Citrix XenServer / XCP-ng 8.3 LTS", Hostname: "xen-pool-master.internal.local",
			Cluster: "XCP-ng Production Resource Pool", VmCount: 22, CpuGhzUsed: 31.0, CpuGhzTotal: 64.0,
			RamGbUsed: 110.0, RamGbTotal: 192.0, DatastoreLatencyMs: 1.4, Status: "ONLINE",
		},
	}

	c.JSON(http.StatusOK, gin.H{"hypervisors": hypervisors, "total": len(hypervisors)})
}

