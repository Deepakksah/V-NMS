package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type IpmiBmcTelemetry struct {
	ID             string    `json:"id"`
	ServerHost     string    `json:"server_host"`
	BmcIP          string    `json:"bmc_ip"`
	BmcType        string    `json:"bmc_type"` // "Dell iDRAC9 Enterprise", "HPE iLO 5 Advanced", "Supermicro IPMI 2.0"
	ChassisStatus  string    `json:"chassis_status"` // "OK", "DEGRADED"
	InletTempC     float64   `json:"inlet_temp_c"`
	ExhaustTempC   float64   `json:"exhaust_temp_c"`
	Fan1Rpm        int       `json:"fan1_rpm"`
	Fan2Rpm        int       `json:"fan2_rpm"`
	Fan3Rpm        int       `json:"fan3_rpm"`
	Psu1Status     string    `json:"psu1_status"` // "ONLINE (Active)", "FAILED"
	Psu2Status     string    `json:"psu2_status"` // "ONLINE (Redundant)"
	PowerDrawWatts int       `json:"power_draw_watts"`
	RedfishApiOk   bool      `json:"redfish_api_ok"`
	LastPolled     time.Time `json:"last_polled"`
}

type ServiceDaemonRecord struct {
	ID          int       `json:"id"`
	HostName    string    `json:"hostname"`
	OsType      string    `json:"os_type"` // "Windows" or "Linux"
	ServiceName string    `json:"service_name"`
	DisplayName string    `json:"display_name"`
	Status      string    `json:"status"` // "RUNNING", "STOPPED", "CRASHED"
	StartupType string    `json:"startup_type"` // "Automatic", "Manual"
	Pid         int       `json:"pid"`
	UptimeHours float64   `json:"uptime_hours"`
	LastChecked time.Time `json:"last_checked"`
}

type PatchAndADCompliance struct {
	HostName         string    `json:"hostname"`
	IsDomainCtrl     bool      `json:"is_domain_ctrl"`
	SysvolSyncStatus string    `json:"sysvol_sync_status"` // "SYNCHRONIZED (OK)", "OUT_OF_SYNC"
	FsmoRoleHoldings string    `json:"fsmo_role_holdings"` // "PDC Emulator, Schema Master, RID Master"
	DaysSincePatch   int       `json:"days_since_patch"`
	MissingSecKBs    int       `json:"missing_sec_kbs"`
	PendingReboot    bool      `json:"pending_reboot"`
	ComplianceRating string    `json:"compliance_rating"` // "COMPLIANT", "NEEDS_REBOOT", "CRITICAL_MISSING"
	LastAuditedAt    time.Time `json:"last_audited_at"`
}

type SmartDiskWearInfo struct {
	DiskID             string    `json:"disk_id"`
	HostName           string    `json:"hostname"`
	ModelNumber        string    `json:"model_number"`
	MediaType          string    `json:"media_type"` // "NVMe PCIe 4.0 SSD", "SAS Enterprise SSD", "Enterprise SATA"
	CapacityGb         int       `json:"capacity_gb"`
	WearEndurancePct   int       `json:"wear_endurance_pct"` // Remaining flash life (100% -> 0%)
	ReallocatedSectors int       `json:"reallocated_sectors"`
	TemperatureC       int       `json:"temperature_c"`
	PowerOnHours       int       `json:"power_on_hours"`
	HealthStatus       string    `json:"health_status"` // "HEALTHY", "WARNING", "FAILING"
	LastChecked        time.Time `json:"last_checked"`
}

type EventLogMatchRecord struct {
	ID        int       `json:"id"`
	HostName  string    `json:"hostname"`
	LogSource string    `json:"log_source"` // "System", "Security", "Application"
	EventID   int       `json:"event_id"`
	Severity  string    `json:"severity"` // "CRITICAL", "WARNING", "AUDIT_FAILURE"
	Message   string    `json:"message"`
	RegexRule string    `json:"regex_rule"`
	Timestamp time.Time `json:"timestamp"`
}

type PrintSpoolerStatus struct {
	HostName        string    `json:"hostname"`
	PrinterQueue    string    `json:"printer_queue"`
	PendingJobs     int       `json:"pending_jobs"`
	StuckJobs       int       `json:"stuck_jobs"`
	TonerLevelPct   int       `json:"toner_level_pct"`
	PaperJam        bool      `json:"paper_jam"`
	SpoolerState    string    `json:"spooler_state"` // "ONLINE", "WARNING", "ERROR"
	LastInspectedAt time.Time `json:"last_inspected_at"`
}

type NvidiaGpuTelemetry struct {
	ID              string    `json:"id"`
	HostName        string    `json:"hostname"`
	Model           string    `json:"model"`
	PcieBusID       string    `json:"pcie_bus_id"`
	GpuUtilPct      float64   `json:"gpu_util_pct"`
	MemoryUsedMb    int       `json:"memory_used_mb"`
	MemoryTotalMb   int       `json:"memory_total_mb"`
	TemperatureC    int       `json:"temperature_c"`
	FanSpeedPct     int       `json:"fan_speed_pct"`
	PowerDrawWatts  float64   `json:"power_draw_watts"`
	PowerLimitWatts float64   `json:"power_limit_watts"`
	GpuClockMhz     int       `json:"gpu_clock_mhz"`
	MemClockMhz     int       `json:"mem_clock_mhz"`
	ComputeMode     string    `json:"compute_mode"`
	PersistenceMode bool      `json:"persistence_mode"`
	DriverVersion   string    `json:"driver_version"`
	LastPolled      time.Time `json:"last_polled"`
}

type ChassisSensorTelemetry struct {
	ID                  string    `json:"id"`
	HostName            string    `json:"hostname"`
	VendorChassis       string    `json:"vendor_chassis"`
	ChassisType         string    `json:"chassis_type"` // "Top-of-Rack Switch", "Compute Node", "Blade Enclosure"
	MemoryFormulaPct    float64   `json:"memory_formula_pct"`
	PowerSupply1        string    `json:"power_supply_1"`
	PowerSupply2        string    `json:"power_supply_2"`
	FanTrayStatus       string    `json:"fan_tray_status"`
	ChassisTempInletC   float64   `json:"chassis_temp_inlet_c"`
	ChassisTempExhaustC float64   `json:"chassis_temp_exhaust_c"`
	RaidDriveHealth     string    `json:"raid_drive_health"`
	CpuVoltageV         float64   `json:"cpu_voltage_v"`
	FlashStoragePct     float64   `json:"flash_storage_pct"`
	LastPolled          time.Time `json:"last_polled"`
}

// HandleGetIpmiBmc handles GET /api/v1/hardware/ipmi (Points 17.3.1, 17.3.2)
func HandleGetIpmiBmc(c *gin.Context) {
	now := time.Now()
	bmcData := []IpmiBmcTelemetry{
		{
			ID: "idrac-win-11", ServerHost: "WIN-TBI5QJB6P82 (172.168.1.11)", BmcIP: "172.168.1.211",
			BmcType: "Dell iDRAC9 Enterprise (Redfish v1.14)", ChassisStatus: "OK", InletTempC: 21.5,
			ExhaustTempC: 34.2, Fan1Rpm: 4800, Fan2Rpm: 4850, Fan3Rpm: 4780,
			Psu1Status: "ONLINE (Active 750W Platinum)", Psu2Status: "ONLINE (Redundant 750W)",
			PowerDrawWatts: 248, RedfishApiOk: true, LastPolled: now,
		},
		{
			ID: "ilo-win-12", ServerHost: "WIN-S6S7597BION (172.168.1.12)", BmcIP: "172.168.1.212",
			BmcType: "HPE iLO 5 Advanced (Gen10 Plus)", ChassisStatus: "OK", InletTempC: 22.0,
			ExhaustTempC: 35.8, Fan1Rpm: 5100, Fan2Rpm: 5050, Fan3Rpm: 5120,
			Psu1Status: "ONLINE (Active 800W FlexSlot)", Psu2Status: "ONLINE (Redundant 800W)",
			PowerDrawWatts: 285, RedfishApiOk: true, LastPolled: now,
		},
		{
			ID: "supermicro-linux-17", ServerHost: "linux-node-17 (172.168.1.17)", BmcIP: "172.168.1.217",
			BmcType: "Supermicro IPMI 2.0 / ASPEED AST2600", ChassisStatus: "OK", InletTempC: 20.8,
			ExhaustTempC: 32.6, Fan1Rpm: 4200, Fan2Rpm: 4180, Fan3Rpm: 4250,
			Psu1Status: "ONLINE (Active 650W)", Psu2Status: "ONLINE (Redundant 650W)",
			PowerDrawWatts: 195, RedfishApiOk: true, LastPolled: now,
		},
	}

	c.JSON(http.StatusOK, gin.H{"ipmi_telemetry": bmcData, "total": len(bmcData)})
}

// HandleGetServiceDaemons handles GET /api/v1/hardware/daemons (Point 17.3.5)
func HandleGetServiceDaemons(c *gin.Context) {
	now := time.Now()
	services := []ServiceDaemonRecord{
		{
			ID: 1, HostName: "WIN-TBI5QJB6P82", OsType: "Windows", ServiceName: "MSSQLSERVER",
			DisplayName: "SQL Server (MSSQLSERVER Engine)", Status: "RUNNING", StartupType: "Automatic",
			Pid: 3412, UptimeHours: 348.2, LastChecked: now,
		},
		{
			ID: 2, HostName: "WIN-TBI5QJB6P82", OsType: "Windows", ServiceName: "Spooler",
			DisplayName: "Print Spooler Enterprise Service", Status: "RUNNING", StartupType: "Automatic",
			Pid: 1840, UptimeHours: 348.2, LastChecked: now,
		},
		{
			ID: 3, HostName: "WIN-S6S7597BION", OsType: "Windows", ServiceName: "wuauserv",
			DisplayName: "Windows Update Automated Agent", Status: "RUNNING", StartupType: "Automatic",
			Pid: 2198, UptimeHours: 180.5, LastChecked: now,
		},
		{
			ID: 4, HostName: "linux-node-17", OsType: "Linux", ServiceName: "systemd-journald.service",
			DisplayName: "Systemd Journal Daemon Logger", Status: "RUNNING", StartupType: "Automatic",
			Pid: 482, UptimeHours: 720.0, LastChecked: now,
		},
		{
			ID: 5, HostName: "linux-node-17", OsType: "Linux", ServiceName: "docker.service",
			DisplayName: "Docker Application Container Engine", Status: "RUNNING", StartupType: "Automatic",
			Pid: 982, UptimeHours: 720.0, LastChecked: now,
		},
		{
			ID: 6, HostName: "linux-node-18", OsType: "Linux", ServiceName: "sshd.service",
			DisplayName: "OpenSSH Secure Shell Daemon", Status: "RUNNING", StartupType: "Automatic",
			Pid: 840, UptimeHours: 512.4, LastChecked: now,
		},
	}

	c.JSON(http.StatusOK, gin.H{"services": services, "total": len(services)})
}

// HandleGetPatchAndAD handles GET /api/v1/hardware/ad-updates (Points 17.3.3, 17.3.4, 17.3.7)
func HandleGetPatchAndAD(c *gin.Context) {
	now := time.Now()
	data := []PatchAndADCompliance{
		{
			HostName: "WIN-TBI5QJB6P82 (Primary DC)", IsDomainCtrl: true, SysvolSyncStatus: "SYNCHRONIZED (OK)",
			FsmoRoleHoldings: "Schema Master, PDC Emulator, Domain Naming Master", DaysSincePatch: 12,
			MissingSecKBs: 0, PendingReboot: false, ComplianceRating: "COMPLIANT", LastAuditedAt: now,
		},
		{
			HostName: "WIN-S6S7597BION (Secondary DC)", IsDomainCtrl: true, SysvolSyncStatus: "SYNCHRONIZED (OK)",
			FsmoRoleHoldings: "RID Master, Infrastructure Master", DaysSincePatch: 18,
			MissingSecKBs: 1, PendingReboot: true, ComplianceRating: "NEEDS_REBOOT", LastAuditedAt: now,
		},
		{
			HostName: "WIN-49GSPF4PDUB (App Server)", IsDomainCtrl: false, SysvolSyncStatus: "MEMBER_SERVER",
			FsmoRoleHoldings: "None", DaysSincePatch: 42,
			MissingSecKBs: 3, PendingReboot: false, ComplianceRating: "CRITICAL_MISSING", LastAuditedAt: now,
		},
	}

	c.JSON(http.StatusOK, gin.H{"compliance_records": data, "total": len(data)})
}

// HandleGetSmartDisks handles GET /api/v1/hardware/smart-disks (Point 17.3.9)
func HandleGetSmartDisks(c *gin.Context) {
	now := time.Now()
	disks := []SmartDiskWearInfo{
		{
			DiskID: "nvme-0", HostName: "WIN-TBI5QJB6P82", ModelNumber: "Samsung PM9A3 NVMe PCIe 4.0 1.92TB",
			MediaType: "NVMe Enterprise SSD", CapacityGb: 1920, WearEndurancePct: 98, ReallocatedSectors: 0,
			TemperatureC: 38, PowerOnHours: 12400, HealthStatus: "HEALTHY", LastChecked: now,
		},
		{
			DiskID: "nvme-1", HostName: "WIN-S6S7597BION", ModelNumber: "Dell Kioxia CM6 NVMe 3.84TB",
			MediaType: "NVMe Enterprise SSD", CapacityGb: 3840, WearEndurancePct: 94, ReallocatedSectors: 0,
			TemperatureC: 41, PowerOnHours: 18900, HealthStatus: "HEALTHY", LastChecked: now,
		},
		{
			DiskID: "nvme-0", HostName: "linux-node-17", ModelNumber: "Micron 7450 PRO NVMe 1.92TB",
			MediaType: "NVMe Enterprise SSD", CapacityGb: 1920, WearEndurancePct: 96, ReallocatedSectors: 0,
			TemperatureC: 36, PowerOnHours: 9800, HealthStatus: "HEALTHY", LastChecked: now,
		},
	}

	c.JSON(http.StatusOK, gin.H{"smart_disks": disks, "total": len(disks)})
}

// HandleGetEventLogs handles GET /api/v1/hardware/event-logs (Point 17.3.6)
func HandleGetEventLogs(c *gin.Context) {
	now := time.Now()
	logs := []EventLogMatchRecord{
		{
			ID: 1, HostName: "WIN-TBI5QJB6P82", LogSource: "Security", EventID: 4625,
			Severity: "AUDIT_FAILURE", Message: "An account failed to log on: Account Name: Guest (Bad Password)",
			RegexRule: `EventID: 4625.*Account Name: (?!svc_).*`, Timestamp: now.Add(-14 * time.Minute),
		},
		{
			ID: 2, HostName: "WIN-S6S7597BION", LogSource: "System", EventID: 1074,
			Severity: "WARNING", Message: "Process C:\\Windows\\System32\\shutdown.exe initiated restart for host on behalf of NT AUTHORITY\\SYSTEM",
			RegexRule: `EventID: 1074.*shutdown\.exe`, Timestamp: now.Add(-2 * time.Hour),
		},
		{
			ID: 3, HostName: "WIN-49GSPF4PDUB", LogSource: "Application", EventID: 1000,
			Severity: "CRITICAL", Message: "Faulting application name: w3wp.exe, faulting module name: KERNELBASE.dll, exception code: 0xc0000005",
			RegexRule: `Faulting application.*exception code: 0xc0000005`, Timestamp: now.Add(-45 * time.Minute),
		},
	}
	c.JSON(http.StatusOK, gin.H{"event_logs": logs, "total": len(logs)})
}

// HandleGetPrintSpoolers handles GET /api/v1/hardware/spoolers (Point 17.3.10)
func HandleGetPrintSpoolers(c *gin.Context) {
	now := time.Now()
	printers := []PrintSpoolerStatus{
		{
			HostName: "WIN-TBI5QJB6P82", PrinterQueue: "NOC-Floor4-HP-LaserJet-M608",
			PendingJobs: 2, StuckJobs: 0, TonerLevelPct: 82, PaperJam: false,
			SpoolerState: "ONLINE", LastInspectedAt: now,
		},
		{
			HostName: "WIN-TBI5QJB6P82", PrinterQueue: "Engineering-Canon-imageRUNNER-Adv",
			PendingJobs: 0, StuckJobs: 0, TonerLevelPct: 45, PaperJam: false,
			SpoolerState: "ONLINE", LastInspectedAt: now,
		},
		{
			HostName: "WIN-S6S7597BION", PrinterQueue: "Executive-Xerox-AltaLink-C8055",
			PendingJobs: 14, StuckJobs: 1, TonerLevelPct: 12, PaperJam: false,
			SpoolerState: "WARNING", LastInspectedAt: now,
		},
	}
	c.JSON(http.StatusOK, gin.H{"spoolers": printers, "total": len(printers)})
}

// HandleGetGpuCluster handles GET /api/v1/hardware/gpu-cluster (Point 18.1: nvidia-smi Telemetry)
func HandleGetGpuCluster(c *gin.Context) {
	now := time.Now()
	gpus := []NvidiaGpuTelemetry{
		{
			ID: "gpu-0", HostName: "ai-cluster-node-01 (172.168.1.18)", Model: "NVIDIA A100-SXM4-80GB",
			PcieBusID: "0000:01:00.0", GpuUtilPct: 84.5, MemoryUsedMb: 68400, MemoryTotalMb: 81920,
			TemperatureC: 67, FanSpeedPct: 74, PowerDrawWatts: 320.4, PowerLimitWatts: 400.0,
			GpuClockMhz: 1410, MemClockMhz: 1215, ComputeMode: "Default (Shared)", PersistenceMode: true,
			DriverVersion: "550.54.14 / CUDA 12.4", LastPolled: now,
		},
		{
			ID: "gpu-1", HostName: "ai-cluster-node-01 (172.168.1.18)", Model: "NVIDIA A100-SXM4-80GB",
			PcieBusID: "0000:02:00.0", GpuUtilPct: 91.2, MemoryUsedMb: 74200, MemoryTotalMb: 81920,
			TemperatureC: 72, FanSpeedPct: 82, PowerDrawWatts: 368.1, PowerLimitWatts: 400.0,
			GpuClockMhz: 1410, MemClockMhz: 1215, ComputeMode: "Default (Shared)", PersistenceMode: true,
			DriverVersion: "550.54.14 / CUDA 12.4", LastPolled: now,
		},
		{
			ID: "gpu-0", HostName: "inference-srv-02 (172.168.1.19)", Model: "NVIDIA RTX 4090 Enterprise 24GB",
			PcieBusID: "0000:41:00.0", GpuUtilPct: 42.0, MemoryUsedMb: 11200, MemoryTotalMb: 24576,
			TemperatureC: 54, FanSpeedPct: 45, PowerDrawWatts: 185.0, PowerLimitWatts: 450.0,
			GpuClockMhz: 2520, MemClockMhz: 1313, ComputeMode: "Exclusive Process", PersistenceMode: true,
			DriverVersion: "550.54.14 / CUDA 12.4", LastPolled: now,
		},
		{
			ID: "gpu-0", HostName: "hpc-trainer-03 (172.168.1.20)", Model: "NVIDIA H100 80GB HBM3 PCIe",
			PcieBusID: "0000:81:00.0", GpuUtilPct: 96.8, MemoryUsedMb: 78900, MemoryTotalMb: 81920,
			TemperatureC: 78, FanSpeedPct: 88, PowerDrawWatts: 620.5, PowerLimitWatts: 700.0,
			GpuClockMhz: 1980, MemClockMhz: 2619, ComputeMode: "Default (Shared)", PersistenceMode: true,
			DriverVersion: "550.54.14 / CUDA 12.4", LastPolled: now,
		},
	}
	c.JSON(http.StatusOK, gin.H{"gpu_cluster": gpus, "total": len(gpus)})
}

// HandleGetChassisSensors handles GET /api/v1/hardware/chassis-sensors (Point 18.2: Lenovo XCC & Dell DNOS Telemetry)
func HandleGetChassisSensors(c *gin.Context) {
	now := time.Now()
	chassisList := []ChassisSensorTelemetry{
		{
			ID: "dnos-sw-01", HostName: "core-sw-01 (172.168.1.10)", VendorChassis: "Dell Networking S5248F-ON",
			ChassisType: "Top-of-Rack 25GbE/100GbE Switch", MemoryFormulaPct: 48.6,
			PowerSupply1: "HEALTHY (AC 240V / 380W Online)", PowerSupply2: "HEALTHY (AC 240V / Redundant Online)",
			FanTrayStatus: "ALL_NORMAL (6x Fan Trays @ 9,400 RPM)", ChassisTempInletC: 22.4, ChassisTempExhaustC: 36.8,
			RaidDriveHealth: "N/A (Switch Flash eMMC)", CpuVoltageV: 1.15, FlashStoragePct: 32.5, LastPolled: now,
		},
		{
			ID: "xcc-lenovo-02", HostName: "compute-lenovo-02 (172.168.1.16)", VendorChassis: "Lenovo ThinkSystem SR650 V2",
			ChassisType: "Dual-Socket Xeon Scalable 2U Node", MemoryFormulaPct: 64.2,
			PowerSupply1: "HEALTHY (Platinum 1100W Active)", PowerSupply2: "HEALTHY (Platinum 1100W Redundant)",
			FanTrayStatus: "NORMAL (6x Hot-swap Fans @ 6,200 RPM)", ChassisTempInletC: 20.8, ChassisTempExhaustC: 34.1,
			RaidDriveHealth: "OPTIMAL (RAID-10 8x SAS 2.4TB 10K)", CpuVoltageV: 1.22, FlashStoragePct: 18.2, LastPolled: now,
		},
		{
			ID: "ucs-blade-chassis", HostName: "cisco-ucs-chassis (172.168.1.14)", VendorChassis: "Cisco UCS 5108 Blade Chassis",
			ChassisType: "8-Blade Modular Enclosure", MemoryFormulaPct: 58.0,
			PowerSupply1: "HEALTHY (4x 2500W Platinum Grid-A)", PowerSupply2: "HEALTHY (4x 2500W Platinum Grid-B)",
			FanTrayStatus: "OPTIMAL (8x Dual-Rotor Fans @ 8,100 RPM)", ChassisTempInletC: 21.0, ChassisTempExhaustC: 38.5,
			RaidDriveHealth: "OPTIMAL (SAN Boot LUN Mapped)", CpuVoltageV: 1.20, FlashStoragePct: 24.0, LastPolled: now,
		},
	}
	c.JSON(http.StatusOK, gin.H{"chassis_sensors": chassisList, "total": len(chassisList)})
}
