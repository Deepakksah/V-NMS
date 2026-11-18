package database

import (
	"context"
	"time"
)

type CloudServiceRecord struct {
	ID          int       `json:"id"`
	Provider    string    `json:"provider"`
	ServiceName string    `json:"service_name"`
	ResourceID  string    `json:"resource_id"`
	Region      string    `json:"region"`
	Status      string    `json:"status"`
	MetricKey   string    `json:"metric_key"`
	MetricValue string    `json:"metric_value"`
	BudgetSpent string    `json:"budget_spent"`
	SlaPercent  float64   `json:"sla_percent"`
	IsDemo      bool      `json:"is_demo"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type VirtualWorkloadRecord struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	Engine        string    `json:"engine"`
	Namespace     string    `json:"namespace"`
	Image         string    `json:"image"`
	Status        string    `json:"status"`
	CpuPercent    float64   `json:"cpu_percent"`
	MemoryUsedMb  float64   `json:"memory_used_mb"`
	MemoryLimitMb float64   `json:"memory_limit_mb"`
	NetRxMb       float64   `json:"net_rx_mb"`
	NetTxMb       float64   `json:"net_tx_mb"`
	Restarts      int       `json:"restarts"`
	Uptime        string    `json:"uptime"`
	IsDemo        bool      `json:"is_demo"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// GetAllCloudServices queries PostgreSQL for registered cloud accounts
func GetAllCloudServices(includeDemo bool) ([]CloudServiceRecord, error) {
	if Pool == nil {
		return []CloudServiceRecord{}, nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT id, provider, service_name, resource_id, region, status, metric_key, metric_value, budget_spent, sla_percent, is_demo, created_at, updated_at
	          FROM cloud_services`
	if !includeDemo {
		query += ` WHERE is_demo = false`
	}
	query += ` ORDER BY id DESC`

	rows, err := Pool.Query(ctx, query)
	if err != nil {
		return []CloudServiceRecord{}, err
	}
	defer rows.Close()

	var list []CloudServiceRecord
	for rows.Next() {
		var r CloudServiceRecord
		if err := rows.Scan(&r.ID, &r.Provider, &r.ServiceName, &r.ResourceID, &r.Region, &r.Status, &r.MetricKey, &r.MetricValue, &r.BudgetSpent, &r.SlaPercent, &r.IsDemo, &r.CreatedAt, &r.UpdatedAt); err == nil {
			list = append(list, r)
		}
	}
	return list, nil
}

// CreateCloudService registers a new real cloud provider service
func CreateCloudService(cs *CloudServiceRecord) error {
	if Pool == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if cs.Status == "" {
		cs.Status = "Healthy"
	}
	if cs.SlaPercent <= 0 {
		cs.SlaPercent = 99.99
	}
	if cs.MetricKey == "" {
		cs.MetricKey = "Status"
	}
	if cs.MetricValue == "" {
		cs.MetricValue = "Online & Verified"
	}

	query := `INSERT INTO cloud_services (provider, service_name, resource_id, region, status, metric_key, metric_value, budget_spent, sla_percent, is_demo)
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	          RETURNING id, created_at, updated_at`

	return Pool.QueryRow(ctx, query,
		cs.Provider, cs.ServiceName, cs.ResourceID, cs.Region, cs.Status, cs.MetricKey, cs.MetricValue, cs.BudgetSpent, cs.SlaPercent, cs.IsDemo,
	).Scan(&cs.ID, &cs.CreatedAt, &cs.UpdatedAt)
}

// DeleteCloudService removes a cloud service by ID
func DeleteCloudService(id int) error {
	if Pool == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := Pool.Exec(ctx, `DELETE FROM cloud_services WHERE id = $1`, id)
	return err
}

// ClearAllCloudServices deletes all cloud services
func ClearAllCloudServices() error {
	if Pool == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := Pool.Exec(ctx, `DELETE FROM cloud_services`)
	return err
}

// SeedCloudDemoData initializes standard enterprise cloud service entries
func SeedCloudDemoData() error {
	if Pool == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	samples := []CloudServiceRecord{
		{
			Provider: "AWS", ServiceName: "EC2 Compute: prod-app-cluster", ResourceID: "i-094fa83b92c418f",
			Region: "us-east-1 (N. Virginia)", Status: "Healthy", MetricKey: "CPUUtilization", MetricValue: "28.4%",
			BudgetSpent: "$480 / $800 mo", SlaPercent: 99.99, IsDemo: true,
		},
		{
			Provider: "AWS", ServiceName: "RDS Multi-AZ PostgreSQL 16", ResourceID: "db-enterprise-core-ha",
			Region: "us-east-1 (N. Virginia)", Status: "Healthy", MetricKey: "FreeStorageSpace", MetricValue: "418 GB Free (82%)",
			BudgetSpent: "$620 / $800 mo", SlaPercent: 99.999, IsDemo: true,
		},
		{
			Provider: "Azure", ServiceName: "Azure VM: Entra ID Sync & ADFS", ResourceID: "vm-azure-identity-01",
			Region: "East US", Status: "Healthy", MetricKey: "Percentage CPU", MetricValue: "18.2%",
			BudgetSpent: "$290 / $500 mo", SlaPercent: 99.95, IsDemo: true,
		},
		{
			Provider: "Microsoft 365", ServiceName: "Exchange Online & Mail Routing", ResourceID: "tenant-enterprise-m365",
			Region: "Global / Multi-Geo", Status: "Healthy", MetricKey: "Active Mailboxes / Quota", MetricValue: "420 / 500 Licenses",
			BudgetSpent: "$9,240 / mo", SlaPercent: 99.995, IsDemo: true,
		},
	}

	for _, s := range samples {
		_, _ = Pool.Exec(ctx, `INSERT INTO cloud_services (provider, service_name, resource_id, region, status, metric_key, metric_value, budget_spent, sla_percent, is_demo)
		                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			s.Provider, s.ServiceName, s.ResourceID, s.Region, s.Status, s.MetricKey, s.MetricValue, s.BudgetSpent, s.SlaPercent, true)
	}
	return nil
}

// GetAllVirtualWorkloads queries registered containers & pods
func GetAllVirtualWorkloads(includeDemo bool) ([]VirtualWorkloadRecord, error) {
	if Pool == nil {
		return []VirtualWorkloadRecord{}, nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT id, name, engine, namespace, image, status, cpu_percent, memory_used_mb, memory_limit_mb, net_rx_mb, net_tx_mb, restarts, uptime, is_demo, created_at, updated_at
	          FROM virtual_workloads`
	if !includeDemo {
		query += ` WHERE is_demo = false`
	}
	query += ` ORDER BY id DESC`

	rows, err := Pool.Query(ctx, query)
	if err != nil {
		return []VirtualWorkloadRecord{}, err
	}
	defer rows.Close()

	var list []VirtualWorkloadRecord
	for rows.Next() {
		var w VirtualWorkloadRecord
		if err := rows.Scan(&w.ID, &w.Name, &w.Engine, &w.Namespace, &w.Image, &w.Status, &w.CpuPercent, &w.MemoryUsedMb, &w.MemoryLimitMb, &w.NetRxMb, &w.NetTxMb, &w.Restarts, &w.Uptime, &w.IsDemo, &w.CreatedAt, &w.UpdatedAt); err == nil {
			list = append(list, w)
		}
	}
	return list, nil
}

// CreateVirtualWorkload registers a container/pod workload
func CreateVirtualWorkload(w *VirtualWorkloadRecord) error {
	if Pool == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if w.Status == "" {
		w.Status = "Running"
	}
	if w.Uptime == "" {
		w.Uptime = "Just registered"
	}
	if w.Namespace == "" {
		w.Namespace = "default"
	}

	query := `INSERT INTO virtual_workloads (name, engine, namespace, image, status, cpu_percent, memory_used_mb, memory_limit_mb, net_rx_mb, net_tx_mb, restarts, uptime, is_demo)
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	          RETURNING id, created_at, updated_at`

	return Pool.QueryRow(ctx, query,
		w.Name, w.Engine, w.Namespace, w.Image, w.Status, w.CpuPercent, w.MemoryUsedMb, w.MemoryLimitMb, w.NetRxMb, w.NetTxMb, w.Restarts, w.Uptime, w.IsDemo,
	).Scan(&w.ID, &w.CreatedAt, &w.UpdatedAt)
}

// DeleteVirtualWorkload removes a container/pod by ID
func DeleteVirtualWorkload(id int) error {
	if Pool == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := Pool.Exec(ctx, `DELETE FROM virtual_workloads WHERE id = $1`, id)
	return err
}

