package service

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"golang.org/x/sys/windows/svc"
	"golang.org/x/sys/windows/svc/eventlog"
	"golang.org/x/sys/windows/svc/mgr"
)

const ServiceName = "VNMSService"
const ServiceDisplayName = "Veracity Network Management System (V-NMS)"
const ServiceDescription = "Enterprise NOC real-time telemetry, SNMP polling, automated subnet discovery, and incident notification engine."

type ServiceRunner struct {
	onStart func()
	onStop  func()
}

func (s *ServiceRunner) Execute(args []string, r <-chan svc.ChangeRequest, changes chan<- svc.Status) (ssec bool, errno uint32) {
	const cmdsAccepted = svc.AcceptStop | svc.AcceptShutdown | svc.AcceptPauseAndContinue

	// 1. Immediately report StartPending to SCM
	changes <- svc.Status{State: svc.StartPending}

	// 2. Ensure working directory is set to the executable location
	exeDir := GetExecutableDir()
	_ = os.Chdir(exeDir)

	// 3. Immediately report Running to SCM
	changes <- svc.Status{State: svc.Running, Accepts: cmdsAccepted}
	log.Println("[Windows Service] VNMSService reported RUNNING to Service Control Manager.")

	// 4. Start the server engine in a goroutine
	if s.onStart != nil {
		go s.onStart()
	}

	// 5. Handle SCM commands
	for c := range r {
		switch c.Cmd {
		case svc.Interrogate:
			changes <- c.CurrentStatus
		case svc.Stop, svc.Shutdown:
			log.Println("[Windows Service] Received Stop/Shutdown command from SCM.")
			changes <- svc.Status{State: svc.StopPending}
			if s.onStop != nil {
				s.onStop()
			}
			changes <- svc.Status{State: svc.Stopped}
			return
		case svc.Pause:
			changes <- svc.Status{State: svc.Paused, Accepts: cmdsAccepted}
		case svc.Continue:
			changes <- svc.Status{State: svc.Running, Accepts: cmdsAccepted}
		}
	}

	return
}

// IsWindowsService checks whether current process was launched by Windows SCM
func IsWindowsService() bool {
	isSvc, err := svc.IsWindowsService()
	if err != nil {
		return false
	}
	return isSvc
}

// RunService runs the service with SCM
func RunService(onStart func(), onStop func()) error {
	runner := &ServiceRunner{onStart: onStart, onStop: onStop}
	return svc.Run(ServiceName, runner)
}

// InstallService registers V-NMS with the Windows Service Control Manager
func InstallService() error {
	exepath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("failed to get executable path: %w", err)
	}

	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("failed to connect to Service Control Manager (run as Administrator): %w", err)
	}
	defer m.Disconnect()

	s, err := m.OpenService(ServiceName)
	if err == nil {
		s.Close()
		return fmt.Errorf("service %s already exists", ServiceName)
	}

	config := mgr.Config{
		ServiceType:  16, // SERVICE_WIN32_OWN_PROCESS
		StartType:    mgr.StartAutomatic,
		ErrorControl: mgr.ErrorNormal,
		DisplayName:  ServiceDisplayName,
		Description:  ServiceDescription,
	}

	s, err = m.CreateService(ServiceName, exepath, config)
	if err != nil {
		return fmt.Errorf("failed to create service: %w", err)
	}
	defer s.Close()

	// Setup event log
	_ = eventlog.InstallAsEventCreate(ServiceName, eventlog.Error|eventlog.Warning|eventlog.Info)

	log.Printf("Service %q installed successfully. Startup: Automatic.", ServiceName)
	return nil
}

// UninstallService removes V-NMS from the Windows Service Control Manager
func UninstallService() error {
	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("failed to connect to Service Control Manager: %w", err)
	}
	defer m.Disconnect()

	s, err := m.OpenService(ServiceName)
	if err != nil {
		return fmt.Errorf("service %s is not installed", ServiceName)
	}
	defer s.Close()

	// Stop service first if running
	status, err := s.Query()
	if err == nil && status.State == svc.Running {
		_, _ = s.Control(svc.Stop)
		time.Sleep(1 * time.Second)
	}

	err = s.Delete()
	if err != nil {
		return fmt.Errorf("failed to delete service: %w", err)
	}

	_ = eventlog.Remove(ServiceName)
	log.Printf("Service %q uninstalled successfully.", ServiceName)
	return nil
}

// StartService starts the registered Windows service
func StartService() error {
	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("failed to connect to Service Control Manager: %w", err)
	}
	defer m.Disconnect()

	s, err := m.OpenService(ServiceName)
	if err != nil {
		return fmt.Errorf("could not access service: %w", err)
	}
	defer s.Close()

	err = s.Start()
	if err != nil {
		return fmt.Errorf("could not start service: %w", err)
	}

	log.Printf("Service %q started successfully.", ServiceName)
	return nil
}

// StopService stops the running Windows service
func StopService() error {
	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("failed to connect to Service Control Manager: %w", err)
	}
	defer m.Disconnect()

	s, err := m.OpenService(ServiceName)
	if err != nil {
		return fmt.Errorf("could not access service: %w", err)
	}
	defer s.Close()

	_, err = s.Control(svc.Stop)
	if err != nil {
		return fmt.Errorf("could not stop service: %w", err)
	}

	log.Printf("Service %q stopped successfully.", ServiceName)
	return nil
}

// GetExecutableDir returns the directory containing the running executable
func GetExecutableDir() string {
	exe, err := os.Executable()
	if err != nil {
		return "."
	}
	return filepath.Dir(exe)
}
