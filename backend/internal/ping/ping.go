package ping

import (
	"bytes"
	"fmt"
	"net"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// PingResult stores latency and reachability
type PingResult struct {
	Alive     bool
	LatencyMs float64
	Error     error
}

// FastPing performs a cross-platform ping (Windows native ping.exe / fallback)
func FastPing(host string, timeout time.Duration) PingResult {
	if runtime.GOOS == "windows" {
		timeoutMs := timeout.Milliseconds()
		if timeoutMs < 1000 {
			timeoutMs = 1000
		}

		cmd := exec.Command("ping", "-n", "1", "-w", strconv.FormatInt(timeoutMs, 10), host)
		var out bytes.Buffer
		cmd.Stdout = &out

		start := time.Now()
		err := cmd.Run()
		elapsed := float64(time.Since(start).Microseconds()) / 1000.0

		output := out.String()
		if err != nil || strings.Contains(output, "Request timed out") || strings.Contains(output, "Destination host unreachable") {
			return PingResult{Alive: false, LatencyMs: 0, Error: fmt.Errorf("host unreachable")}
		}

		// Parse "time=12ms" or "time<1ms" from windows ping output
		latency := elapsed
		if idx := strings.Index(output, "time="); idx != -1 {
			sub := output[idx+5:]
			if end := strings.Index(sub, "ms"); end != -1 {
				if parsed, parseErr := strconv.ParseFloat(strings.TrimSpace(sub[:end]), 64); parseErr == nil {
					latency = parsed
				}
			}
		} else if strings.Contains(output, "time<1ms") {
			latency = 0.5
		}

		return PingResult{Alive: true, LatencyMs: latency, Error: nil}
	}

	// Fallback for non-windows TCP probe if ICMP raw socket not permitted
	conn, err := net.DialTimeout("tcp", net.JoinHostPort(host, "80"), timeout)
	if err == nil {
		conn.Close()
		return PingResult{Alive: true, LatencyMs: 1.0, Error: nil}
	}
	return PingResult{Alive: false, LatencyMs: 0, Error: err}
}
