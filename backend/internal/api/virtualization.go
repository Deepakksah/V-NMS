package api

import (
	"net/http"
	"time"

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
	now := time.Now()
	containers := []ContainerWorkload{
		{
			ID: "c18f3a9", Name: "vnms-backend-core", Engine: "Docker", Namespace: "v-nms-prod",
			Image: "veracity/vnms-backend:v2.4", Status: "Healthy", CpuPercent: 1.2, MemoryUsedMb: 64,
			MemoryLimitMb: 512, NetRxMb: 42.8, NetTxMb: 58.2, Restarts: 0, Uptime: "14 Days", CreatedAt: now.Add(-14 * 24 * time.Hour),
		},
		{
			ID: "c29d4b1", Name: "vnms-postgres-db", Engine: "Docker", Namespace: "v-nms-prod",
			Image: "postgres:18-alpine", Status: "Healthy", CpuPercent: 2.4, MemoryUsedMb: 184,
			MemoryLimitMb: 2048, NetRxMb: 112.4, NetTxMb: 94.6, Restarts: 0, Uptime: "14 Days", CreatedAt: now.Add(-14 * 24 * time.Hour),
		},
		{
			ID: "c72e5c8", Name: "redis-session-cache", Engine: "Docker", Namespace: "v-nms-prod",
			Image: "redis:7.2-alpine", Status: "Healthy", CpuPercent: 0.4, MemoryUsedMb: 32,
			MemoryLimitMb: 256, NetRxMb: 18.5, NetTxMb: 14.1, Restarts: 0, Uptime: "14 Days", CreatedAt: now.Add(-14 * 24 * time.Hour),
		},
		{
			ID: "k8s-pod-91a", Name: "api-gateway-deployment-74f8", Engine: "Kubernetes", Namespace: "production",
			Image: "envoyproxy/envoy:v1.28", Status: "Running", CpuPercent: 3.8, MemoryUsedMb: 128,
			MemoryLimitMb: 512, NetRxMb: 384.2, NetTxMb: 412.0, Restarts: 0, Uptime: "6 Days", CreatedAt: now.Add(-6 * 24 * time.Hour),
		},
		{
			ID: "k8s-pod-43b", Name: "payment-checkout-worker-52d1", Engine: "Kubernetes", Namespace: "production",
			Image: "fintech/checkout:2.1", Status: "Running", CpuPercent: 4.5, MemoryUsedMb: 256,
			MemoryLimitMb: 1024, NetRxMb: 89.1, NetTxMb: 76.4, Restarts: 1, Uptime: "3 Days", CreatedAt: now.Add(-3 * 24 * time.Hour),
		},
		{
			ID: "k8s-pod-12c", Name: "analytics-etl-batch-908c", Engine: "Kubernetes", Namespace: "analytics",
			Image: "apache/spark-py:v3.5", Status: "Running", CpuPercent: 14.2, MemoryUsedMb: 840,
			MemoryLimitMb: 2048, NetRxMb: 642.0, NetTxMb: 580.4, Restarts: 0, Uptime: "18 Hours", CreatedAt: now.Add(-18 * time.Hour),
		},
	}

	c.JSON(http.StatusOK, gin.H{"workloads": containers, "total": len(containers)})
}

// HandleGetCloudTelemetry handles GET /api/v1/virtualization/cloud
func HandleGetCloudTelemetry(c *gin.Context) {
	now := time.Now()
	clouds := []CloudService{
		{
			ID: "aws-ec2-prod-01", Provider: "AWS", ServiceName: "EC2 Compute: prod-app-cluster",
			ResourceID: "i-094fa83b92c418f", Region: "us-east-1 (N. Virginia)", Status: "Healthy",
			MetricKey: "CPUUtilization", MetricValue: "28.4%", BudgetSpent: "$480 / $800 mo", SlaPercent: 99.99, LastPolled: now,
		},
		{
			ID: "aws-rds-postgres", Provider: "AWS", ServiceName: "RDS Multi-AZ PostgreSQL 16",
			ResourceID: "db-enterprise-core-ha", Region: "us-east-1 (N. Virginia)", Status: "Healthy",
			MetricKey: "FreeStorageSpace", MetricValue: "418 GB Free (82%)", BudgetSpent: "$620 / $800 mo", SlaPercent: 99.999, LastPolled: now,
		},
		{
			ID: "aws-s3-backups", Provider: "AWS", ServiceName: "S3 Enterprise Archive Bucket",
			ResourceID: "arn:aws:s3:::vnms-nightly-snapshots", Region: "us-east-1", Status: "Healthy",
			MetricKey: "BucketSizeBytes", MetricValue: "4.82 TB (Encrypted AES-256)", SlaPercent: 100.0, LastPolled: now,
		},
		{
			ID: "azure-vm-adfs", Provider: "Azure", ServiceName: "Azure VM: Entra ID Sync & ADFS",
			ResourceID: "vm-azure-identity-01", Region: "East US", Status: "Healthy",
			MetricKey: "Percentage CPU", MetricValue: "18.2%", BudgetSpent: "$290 / $500 mo", SlaPercent: 99.95, LastPolled: now,
		},
		{
			ID: "azure-sql-fin", Provider: "Azure", ServiceName: "Azure SQL Hyperscale DB",
			ResourceID: "sql-fin-prod-eastus", Region: "East US", Status: "Healthy",
			MetricKey: "DTU Consumption %", MetricValue: "34.0%", BudgetSpent: "$540 / $750 mo", SlaPercent: 99.99, LastPolled: now,
		},
	}

	c.JSON(http.StatusOK, gin.H{"cloud_services": clouds, "total": len(clouds)})
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
	}

	c.JSON(http.StatusOK, gin.H{"hypervisors": hypervisors, "total": len(hypervisors)})
}
