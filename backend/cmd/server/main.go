package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"v-nms/internal/api"
	"v-nms/internal/database"
	"v-nms/internal/poller"
	"v-nms/internal/service"
)

var httpServer *http.Server

// loadEnvFile reads simple KEY=VAL pairs from a file if it exists
func loadEnvFile(path string) {
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			k := strings.TrimSpace(parts[0])
			v := strings.TrimSpace(parts[1])
			if os.Getenv(k) == "" {
				_ = os.Setenv(k, v)
			}
		}
	}
}

func startEngine() {
	exeDir := service.GetExecutableDir()
	_ = os.Chdir(exeDir)

	// Setup Logging
	logDir := filepath.Join(exeDir, "logs")
	_ = os.MkdirAll(logDir, 0755)
	logFile, err := os.OpenFile(filepath.Join(logDir, "vnms.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err == nil {
		log.SetOutput(logFile)
	}

	// Load config (.env or config.env from exe directory)
	loadEnvFile(filepath.Join(exeDir, "config.env"))
	loadEnvFile(filepath.Join(exeDir, ".env"))
	loadEnvFile(".env")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:root@127.0.0.1:5432/vnms?sslmode=disable"
	}

	log.Println("==================================================")
	log.Println("  Veracity Network Management System (V-NMS)")
	log.Printf("  Running on Port: %s\n", port)
	log.Println("==================================================")

	// Connect to PostgreSQL (Auto-creates vnms database and runs migrations)
	if err := database.ConnectDB(dbURL); err != nil {
		log.Printf("Database connection notice: %v", err)
	}

	// Network discovery will be triggered manually by user via UI/API
	log.Println("[Engine] Network Discovery ready for manual user trigger.")

	// Start Autonomous High-Concurrency Poller (Fast-Ping & SNMP)
	poller.StartBackgroundPoller(30 * time.Second)

	// Setup REST API + Embedded Web SPA Interface
	router := api.SetupRouter()

	httpServer = &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	log.Printf("🚀 V-NMS Enterprise NOC Engine running on http://127.0.0.1:%s", port)
	if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Printf("Server error: %v", err)
	}
}

func stopEngine() {
	if httpServer != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		_ = httpServer.Shutdown(ctx)
	}
}

func main() {
	// Parse CLI flags
	serviceAction := flag.String("service", "", "Windows Service action: install | uninstall | start | stop")
	customPort := flag.String("port", "", "Custom HTTP port (e.g. 8081)")
	flag.Parse()

	// 1. Handle Windows Service Management Commands
	if *serviceAction != "" {
		switch strings.ToLower(*serviceAction) {
		case "install":
			if err := service.InstallService(); err != nil {
				log.Fatalf("Error installing service: %v", err)
			}
			return
		case "uninstall", "remove":
			if err := service.UninstallService(); err != nil {
				log.Fatalf("Error uninstalling service: %v", err)
			}
			return
		case "start":
			if err := service.StartService(); err != nil {
				log.Fatalf("Error starting service: %v", err)
			}
			return
		case "stop":
			if err := service.StopService(); err != nil {
				log.Fatalf("Error stopping service: %v", err)
			}
			return
		default:
			fmt.Printf("Unknown service action %q. Valid options: install, uninstall, start, stop\n", *serviceAction)
			return
		}
	}

	// 2. Check if running as a Windows Service
	if service.IsWindowsService() {
		if err := service.RunService(startEngine, stopEngine); err != nil {
			log.Fatalf("Windows Service failure: %v", err)
		}
		return
	}

	// 3. Interactive/Console Mode
	if *customPort != "" {
		_ = os.Setenv("PORT", *customPort)
	}
	startEngine()
}
