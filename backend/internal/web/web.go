package web

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

//go:embed all:dist
var embeddedFS embed.FS

var (
	distFS    fs.FS
	indexHTML []byte
)

func init() {
	var err error
	distFS, err = fs.Sub(embeddedFS, "dist")
	if err != nil {
		return
	}
	indexHTML, _ = embeddedFS.ReadFile("dist/index.html")
}

// RegisterWebRoutes registers embedded SPA frontend routes on the Gin engine
func RegisterWebRoutes(r *gin.Engine) {
	if distFS == nil {
		return
	}

	httpFS := http.FS(distFS)
	fileServer := http.FileServer(httpFS)

	// Catch-all route for frontend static files and SPA fallback
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// Never intercept API routes
		if strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "API route not found"})
			return
		}

		// Check if file exists in embedded dist
		cleanPath := strings.TrimPrefix(path, "/")
		if cleanPath != "" {
			if f, err := distFS.Open(cleanPath); err == nil {
				_ = f.Close()
				fileServer.ServeHTTP(c.Writer, c.Request)
				return
			}
		}

		// Fallback to index.html for SPA client-side routes
		if len(indexHTML) > 0 {
			c.Data(http.StatusOK, "text/html; charset=utf-8", indexHTML)
			return
		}

		c.String(http.StatusNotFound, "V-NMS Dashboard not found")
	})
}

