// V-NMS Port 80 Hostname Router
// Routes http://V-NMS-Dashboard.com → localhost:8081 (V-NMS)
// Routes everything else             → localhost:8085  (PRTG)
package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

func newProxy(target string) *httputil.ReverseProxy {
	u, err := url.Parse(target)
	if err != nil {
		log.Fatalf("Bad proxy target %s: %v", target, err)
	}
	return httputil.NewSingleHostReverseProxy(u)
}

func main() {
	vnmsProxy := newProxy("http://127.0.0.1:8081")
	prtgProxy := newProxy("http://127.0.0.1:8085")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		host := strings.ToLower(r.Host)
		// Strip port if present
		if idx := strings.Index(host, ":"); idx != -1 {
			host = host[:idx]
		}
		switch host {
		case "v-nms-dashboard.com", "www.v-nms-dashboard.com",
			"vnms-dashboard.com", "v-nms.com", "www.v-nms.com":
			vnmsProxy.ServeHTTP(w, r)
		default:
			prtgProxy.ServeHTTP(w, r)
		}
	})

	// Listen ONLY on the virtual IP 172.168.1.100:80 (PRTG owns 172.168.1.11:80)
	addr := "172.168.1.100:80"
	log.Printf("[V-NMS Router] Listening on %s", addr)
	log.Println("  → v-nms-dashboard.com  → :8081 (V-NMS)")
	log.Fatal(http.ListenAndServe(addr, nil))
}
