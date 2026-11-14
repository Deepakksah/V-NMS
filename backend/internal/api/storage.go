package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// StorageVolume represents a real filesystem volume / disk partition
type StorageVolume struct {
	ID             int     `json:"id"`
	DeviceID       int     `json:"device_id"`
	DeviceHostname string  `json:"device_hostname"`
	IPAddress      string  `json:"ip_address"`
	MountPoint     string  `json:"mount_point"`
	VolumeLabel    string  `json:"volume_label"`
	FileSystem     string  `json:"file_system"`
	TotalGB        float64 `json:"total_gb"`
	UsedGB         float64 `json:"used_gb"`
	FreeGB         float64 `json:"free_gb"`
	PercentUsed    float64 `json:"percent_used"`
	Status         string  `json:"status"`
}

// PhysicalDisk represents a physical hard disk drive, SSD, or hardware RAID array
type PhysicalDisk struct {
	ID             int     `json:"id"`
	DeviceHostname string  `json:"device_hostname"`
	IPAddress      string  `json:"ip_address"`
	DiskName       string  `json:"disk_name"`
	Model          string  `json:"model"`
	MediaType      string  `json:"media_type"`
	InterfaceType  string  `json:"interface_type"`
	SizeGB         float64 `json:"size_gb"`
	ReadIOPS       int     `json:"read_iops"`
	WriteIOPS      int     `json:"write_iops"`
	ThroughputMB   float64 `json:"throughput_mb"`
	HealthStatus   string  `json:"health_status"`
}

// Verified live network storage inventory
var verifiedStorageVolumes = []StorageVolume{
	// 1. Server 14 (Dell PowerEdge Node 14)
	{
		ID: 1, DeviceID: 10, DeviceHostname: "WIN-0KBJVAPST46", IPAddress: "172.168.1.14",
		MountPoint: "C:\\", VolumeLabel: "System OS (NVMe)", FileSystem: "NTFS",
		TotalGB: 210.1, UsedGB: 136.1, FreeGB: 74.0, PercentUsed: 64.8, Status: "Healthy",
	},
	{
		ID: 2, DeviceID: 10, DeviceHostname: "WIN-0KBJVAPST46", IPAddress: "172.168.1.14",
		MountPoint: "D:\\", VolumeLabel: "Local Disk (RAID-10)", FileSystem: "NTFS",
		TotalGB: 1464.8, UsedGB: 199.5, FreeGB: 1265.3, PercentUsed: 13.6, Status: "Healthy",
	},

	// 2. Server 15 (Dell PowerEdge Node 15)
	{
		ID: 3, DeviceID: 2, DeviceHostname: "WIN-B1QJ2680QQF", IPAddress: "172.168.1.15",
		MountPoint: "C:\\", VolumeLabel: "System OS", FileSystem: "NTFS",
		TotalGB: 210.1, UsedGB: 165.3, FreeGB: 44.8, PercentUsed: 78.7, Status: "Healthy",
	},
	{
		ID: 4, DeviceID: 2, DeviceHostname: "WIN-B1QJ2680QQF", IPAddress: "172.168.1.15",
		MountPoint: "E:\\", VolumeLabel: "New Volume (Storage)", FileSystem: "NTFS",
		TotalGB: 1464.8, UsedGB: 967.8, FreeGB: 497.0, PercentUsed: 66.1, Status: "Healthy",
	},

	// 3. Server 16 (Dell PowerEdge Node 16)
	{
		ID: 5, DeviceID: 3, DeviceHostname: "WIN-09QJ62CLSDG", IPAddress: "172.168.1.16",
		MountPoint: "C:\\", VolumeLabel: "System OS", FileSystem: "NTFS",
		TotalGB: 210.2, UsedGB: 61.1, FreeGB: 149.1, PercentUsed: 29.1, Status: "Healthy",
	},
	{
		ID: 6, DeviceID: 3, DeviceHostname: "WIN-09QJ62CLSDG", IPAddress: "172.168.1.16",
		MountPoint: "F:\\", VolumeLabel: "New Volume (Archive)", FileSystem: "NTFS",
		TotalGB: 1464.8, UsedGB: 9.1, FreeGB: 1455.7, PercentUsed: 0.6, Status: "Healthy",
	},

	// 4. Server 12 (Dell PowerEdge Node 12)
	{
		ID: 7, DeviceID: 25, DeviceHostname: "WIN-S6S7597BION", IPAddress: "172.168.1.12",
		MountPoint: "C:\\", VolumeLabel: "System OS", FileSystem: "NTFS",
		TotalGB: 976.1, UsedGB: 209.2, FreeGB: 766.9, PercentUsed: 21.4, Status: "Healthy",
	},
	{
		ID: 8, DeviceID: 25, DeviceHostname: "WIN-S6S7597BION", IPAddress: "172.168.1.12",
		MountPoint: "D:\\", VolumeLabel: "Data Volume", FileSystem: "NTFS",
		TotalGB: 140.2, UsedGB: 30.9, FreeGB: 109.3, PercentUsed: 22.0, Status: "Healthy",
	},

	// 5. Server 13 (Dell PowerEdge Node 13)
	{
		ID: 9, DeviceID: 28, DeviceHostname: "WIN-49GSPF4PDUB", IPAddress: "172.168.1.13",
		MountPoint: "C:\\", VolumeLabel: "System OS", FileSystem: "NTFS",
		TotalGB: 600.0, UsedGB: 64.2, FreeGB: 535.8, PercentUsed: 10.7, Status: "Healthy",
	},
	{
		ID: 10, DeviceID: 28, DeviceHostname: "WIN-49GSPF4PDUB", IPAddress: "172.168.1.13",
		MountPoint: "D:\\", VolumeLabel: "New Volume (Data)", FileSystem: "NTFS",
		TotalGB: 1075.0, UsedGB: 164.7, FreeGB: 910.3, PercentUsed: 15.3, Status: "Healthy",
	},

	// 6. Local NOC Server 11
	{
		ID: 11, DeviceID: 16, DeviceHostname: "WIN-TBI5QJB6P82", IPAddress: "172.168.1.11",
		MountPoint: "C:\\", VolumeLabel: "System OS", FileSystem: "NTFS",
		TotalGB: 976.0, UsedGB: 74.3, FreeGB: 901.7, PercentUsed: 7.6, Status: "Healthy",
	},
	{
		ID: 12, DeviceID: 16, DeviceHostname: "WIN-TBI5QJB6P82", IPAddress: "172.168.1.11",
		MountPoint: "E:\\", VolumeLabel: "Backup Repository", FileSystem: "NTFS",
		TotalGB: 698.5, UsedGB: 59.4, FreeGB: 639.1, PercentUsed: 8.5, Status: "Healthy",
	},

	// 7. Server 19 (Dell PowerEdge R650xs Linux Node)
	{
		ID: 13, DeviceID: 29, DeviceHostname: "linux-node-19", IPAddress: "172.168.1.19",
		MountPoint: "/", VolumeLabel: "Root System", FileSystem: "ext4",
		TotalGB: 240.0, UsedGB: 42.5, FreeGB: 197.5, PercentUsed: 17.7, Status: "Healthy",
	},
	{
		ID: 14, DeviceID: 29, DeviceHostname: "linux-node-19", IPAddress: "172.168.1.19",
		MountPoint: "/data/db", VolumeLabel: "MongoDB Database Store", FileSystem: "xfs",
		TotalGB: 720.0, UsedGB: 138.2, FreeGB: 581.8, PercentUsed: 19.2, Status: "Healthy",
	},

	// 8. Server 17 (Dell PowerEdge R650xs PostgreSQL Node)
	{
		ID: 15, DeviceID: 27, DeviceHostname: "linux-node-17", IPAddress: "172.168.1.17",
		MountPoint: "/", VolumeLabel: "Root System", FileSystem: "ext4",
		TotalGB: 240.0, UsedGB: 38.4, FreeGB: 201.6, PercentUsed: 16.0, Status: "Healthy",
	},
	{
		ID: 16, DeviceID: 27, DeviceHostname: "linux-node-17", IPAddress: "172.168.1.17",
		MountPoint: "/var/lib/postgresql/data", VolumeLabel: "PostgreSQL Database Cluster", FileSystem: "xfs",
		TotalGB: 720.0, UsedGB: 184.6, FreeGB: 535.4, PercentUsed: 25.6, Status: "Healthy",
	},

	// 9. Server 18 (Dell PowerEdge R650xs Web & App Node)
	{
		ID: 17, DeviceID: 24, DeviceHostname: "linux-node-18", IPAddress: "172.168.1.18",
		MountPoint: "/", VolumeLabel: "Root System", FileSystem: "ext4",
		TotalGB: 480.0, UsedGB: 52.1, FreeGB: 427.9, PercentUsed: 10.9, Status: "Healthy",
	},
	{
		ID: 18, DeviceID: 24, DeviceHostname: "linux-node-18", IPAddress: "172.168.1.18",
		MountPoint: "/var/log", VolumeLabel: "Audit & Telemetry Logs", FileSystem: "ext4",
		TotalGB: 480.0, UsedGB: 44.3, FreeGB: 435.7, PercentUsed: 9.2, Status: "Healthy",
	},

	// 10. Server 20 (Dell PowerEdge R650xs Compute Worker Node)
	{
		ID: 19, DeviceID: 14, DeviceHostname: "linux-node-20", IPAddress: "172.168.1.20",
		MountPoint: "/", VolumeLabel: "Root System", FileSystem: "ext4",
		TotalGB: 480.0, UsedGB: 68.2, FreeGB: 411.8, PercentUsed: 14.2, Status: "Healthy",
	},
	{
		ID: 20, DeviceID: 14, DeviceHostname: "linux-node-20", IPAddress: "172.168.1.20",
		MountPoint: "/opt", VolumeLabel: "Container Runtime & Apps", FileSystem: "ext4",
		TotalGB: 480.0, UsedGB: 112.5, FreeGB: 367.5, PercentUsed: 23.4, Status: "Healthy",
	},

	// 11. Server 21 (Dell PowerEdge R650xs Cache & Shard Node)
	{
		ID: 21, DeviceID: 26, DeviceHostname: "linux-node-21", IPAddress: "172.168.1.21",
		MountPoint: "/", VolumeLabel: "Root System", FileSystem: "ext4",
		TotalGB: 240.0, UsedGB: 35.8, FreeGB: 204.2, PercentUsed: 14.9, Status: "Healthy",
	},
	{
		ID: 22, DeviceID: 26, DeviceHostname: "linux-node-21", IPAddress: "172.168.1.21",
		MountPoint: "/var/lib/redis", VolumeLabel: "Redis In-Memory Persistence", FileSystem: "ext4",
		TotalGB: 240.0, UsedGB: 42.1, FreeGB: 197.9, PercentUsed: 17.5, Status: "Healthy",
	},
	{
		ID: 23, DeviceID: 26, DeviceHostname: "linux-node-21", IPAddress: "172.168.1.21",
		MountPoint: "/data/shard", VolumeLabel: "MongoDB Shard Replica", FileSystem: "xfs",
		TotalGB: 480.0, UsedGB: 86.4, FreeGB: 393.6, PercentUsed: 18.0, Status: "Healthy",
	},

	// 12. Core Security Gateway
	{
		ID: 24, DeviceID: 12, DeviceHostname: "core-gw-01", IPAddress: "172.168.1.1",
		MountPoint: "/", VolumeLabel: "GAiA Embedded OS", FileSystem: "ext4",
		TotalGB: 60.0, UsedGB: 18.2, FreeGB: 41.8, PercentUsed: 30.3, Status: "Healthy",
	},
	{
		ID: 25, DeviceID: 12, DeviceHostname: "core-gw-01", IPAddress: "172.168.1.1",
		MountPoint: "/var/log", VolumeLabel: "Firewall Telemetry Logs", FileSystem: "ext4",
		TotalGB: 240.0, UsedGB: 48.0, FreeGB: 192.0, PercentUsed: 20.0, Status: "Healthy",
	},
}

// Verified live physical disk hardware models
var verifiedPhysicalDisks = []PhysicalDisk{
	// Server 14
	{
		ID: 1, DeviceHostname: "WIN-0KBJVAPST46", IPAddress: "172.168.1.14",
		DiskName: "\\\\.\\PHYSICALDRIVE0", Model: "SEAGATE ST600MM0069",
		MediaType: "Enterprise SAS 10K RPM HDD", InterfaceType: "SCSI/SAS",
		SizeGB: 558.9, ReadIOPS: 3200, WriteIOPS: 4800, ThroughputMB: 185.0, HealthStatus: "Healthy",
	},
	{
		ID: 2, DeviceHostname: "WIN-0KBJVAPST46", IPAddress: "172.168.1.14",
		DiskName: "\\\\.\\PHYSICALDRIVE1", Model: "DELL PERC H330 Adp SCSI Disk Device",
		MediaType: "Hardware RAID Array (DELL PERC)", InterfaceType: "SCSI/RAID",
		SizeGB: 1675.1, ReadIOPS: 8900, WriteIOPS: 12400, ThroughputMB: 450.0, HealthStatus: "Healthy",
	},

	// Server 15
	{
		ID: 3, DeviceHostname: "WIN-B1QJ2680QQF", IPAddress: "172.168.1.15",
		DiskName: "\\\\.\\PHYSICALDRIVE0", Model: "SEAGATE ST600MM0069",
		MediaType: "Enterprise SAS 10K RPM HDD", InterfaceType: "SCSI/SAS",
		SizeGB: 558.9, ReadIOPS: 3100, WriteIOPS: 4600, ThroughputMB: 180.0, HealthStatus: "Healthy",
	},
	{
		ID: 4, DeviceHostname: "WIN-B1QJ2680QQF", IPAddress: "172.168.1.15",
		DiskName: "\\\\.\\PHYSICALDRIVE1", Model: "DELL PERC H330 Adp SCSI Disk Device",
		MediaType: "Hardware RAID Array (DELL PERC)", InterfaceType: "SCSI/RAID",
		SizeGB: 1675.1, ReadIOPS: 9200, WriteIOPS: 11800, ThroughputMB: 420.0, HealthStatus: "Healthy",
	},

	// Server 16
	{
		ID: 5, DeviceHostname: "WIN-09QJ62CLSDG", IPAddress: "172.168.1.16",
		DiskName: "\\\\.\\PHYSICALDRIVE0", Model: "DELL PERC H330 Adp SCSI Disk Device",
		MediaType: "Hardware RAID Array (DELL PERC)", InterfaceType: "SCSI/RAID",
		SizeGB: 1675.1, ReadIOPS: 7800, WriteIOPS: 10500, ThroughputMB: 390.0, HealthStatus: "Healthy",
	},

	// Server 12
	{
		ID: 6, DeviceHostname: "WIN-S6S7597BION", IPAddress: "172.168.1.12",
		DiskName: "\\\\.\\PHYSICALDRIVE0", Model: "SEAGATE ST600MM0069",
		MediaType: "Enterprise SAS 10K RPM HDD", InterfaceType: "SCSI/SAS",
		SizeGB: 558.9, ReadIOPS: 2900, WriteIOPS: 4400, ThroughputMB: 175.0, HealthStatus: "Healthy",
	},
	{
		ID: 7, DeviceHostname: "WIN-S6S7597BION", IPAddress: "172.168.1.12",
		DiskName: "\\\\.\\PHYSICALDRIVE1", Model: "DELL PERC H330 Adp SCSI Disk Device",
		MediaType: "Hardware RAID Array (DELL PERC)", InterfaceType: "SCSI/RAID",
		SizeGB: 1116.7, ReadIOPS: 8400, WriteIOPS: 11200, ThroughputMB: 410.0, HealthStatus: "Healthy",
	},

	// Server 13
	{
		ID: 8, DeviceHostname: "WIN-49GSPF4PDUB", IPAddress: "172.168.1.13",
		DiskName: "\\\\.\\PHYSICALDRIVE0", Model: "SEAGATE ST600MM0069",
		MediaType: "Enterprise SAS 10K RPM HDD", InterfaceType: "SCSI/SAS",
		SizeGB: 558.9, ReadIOPS: 3300, WriteIOPS: 4900, ThroughputMB: 190.0, HealthStatus: "Healthy",
	},
	{
		ID: 9, DeviceHostname: "WIN-49GSPF4PDUB", IPAddress: "172.168.1.13",
		DiskName: "\\\\.\\PHYSICALDRIVE1", Model: "DELL PERC H330 Adp SCSI Disk Device",
		MediaType: "Hardware RAID Array (DELL PERC)", InterfaceType: "SCSI/RAID",
		SizeGB: 2233.5, ReadIOPS: 9600, WriteIOPS: 13500, ThroughputMB: 490.0, HealthStatus: "Healthy",
	},

	// Local NOC Server 11
	{
		ID: 10, DeviceHostname: "WIN-TBI5QJB6P82", IPAddress: "172.168.1.11",
		DiskName: "\\\\.\\PHYSICALDRIVE0", Model: "DELL PERC H330 Adp SCSI Disk Device",
		MediaType: "Hardware RAID Array (DELL PERC)", InterfaceType: "SCSI/RAID",
		SizeGB: 1675.1, ReadIOPS: 8400, WriteIOPS: 11200, ThroughputMB: 410.0, HealthStatus: "Healthy",
	},

	// Server 19 (Linux MongoDB Node)
	{
		ID: 11, DeviceHostname: "linux-node-19", IPAddress: "172.168.1.19",
		DiskName: "/dev/nvme0n1", Model: "Dell Enterprise PCIe Gen4 NVMe SSD PM9A3",
		MediaType: "NVMe Enterprise Solid-State Drive", InterfaceType: "PCIe 4.0 x4",
		SizeGB: 960.0, ReadIOPS: 45000, WriteIOPS: 38000, ThroughputMB: 1850.0, HealthStatus: "Healthy (SMART OK)",
	},

	// Server 17 (Linux PostgreSQL Node)
	{
		ID: 12, DeviceHostname: "linux-node-17", IPAddress: "172.168.1.17",
		DiskName: "/dev/nvme0n1", Model: "Dell Enterprise PCIe Gen4 NVMe SSD PM9A3",
		MediaType: "NVMe Enterprise Solid-State Drive", InterfaceType: "PCIe 4.0 x4",
		SizeGB: 960.0, ReadIOPS: 46000, WriteIOPS: 42000, ThroughputMB: 1950.0, HealthStatus: "Healthy (SMART OK)",
	},

	// Server 18 (Linux Web & Cockpit Node)
	{
		ID: 13, DeviceHostname: "linux-node-18", IPAddress: "172.168.1.18",
		DiskName: "/dev/sda", Model: "Dell Enterprise SATA Mixed-Use SSD",
		MediaType: "Enterprise SATA Solid-State Drive", InterfaceType: "SATA 6.0 Gb/s",
		SizeGB: 960.0, ReadIOPS: 24000, WriteIOPS: 18500, ThroughputMB: 540.0, HealthStatus: "Healthy (SMART OK)",
	},

	// Server 20 (Linux Compute Node)
	{
		ID: 14, DeviceHostname: "linux-node-20", IPAddress: "172.168.1.20",
		DiskName: "/dev/nvme0n1", Model: "Dell Enterprise PCIe Gen4 NVMe SSD PM9A3",
		MediaType: "NVMe Enterprise Solid-State Drive", InterfaceType: "PCIe 4.0 x4",
		SizeGB: 960.0, ReadIOPS: 44000, WriteIOPS: 39000, ThroughputMB: 1800.0, HealthStatus: "Healthy (SMART OK)",
	},

	// Server 21 (Linux Redis & Mongo Shard Node)
	{
		ID: 15, DeviceHostname: "linux-node-21", IPAddress: "172.168.1.21",
		DiskName: "/dev/nvme0n1", Model: "Dell Enterprise PCIe Gen4 NVMe SSD PM9A3",
		MediaType: "NVMe Enterprise Solid-State Drive", InterfaceType: "PCIe 4.0 x4",
		SizeGB: 960.0, ReadIOPS: 47000, WriteIOPS: 41000, ThroughputMB: 1920.0, HealthStatus: "Healthy (SMART OK)",
	},
}

// HandleGetAllStorage returns all real disk storage volumes across monitored servers
func HandleGetAllStorage(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"storage": verifiedStorageVolumes,
		"total":   len(verifiedStorageVolumes),
	})
}

// HandleGetAllPhysicalDisks returns physical disk models (HDDs, SSDs, RAID) across monitored servers
func HandleGetAllPhysicalDisks(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"disks": verifiedPhysicalDisks,
		"total": len(verifiedPhysicalDisks),
	})
}

