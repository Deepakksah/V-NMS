package api

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
)

type MibFileInfo struct {
	Name        string `json:"name"`
	Size        int64  `json:"size"`
	Category    string `json:"category"`
	Vendor      string `json:"vendor"`
	Description string `json:"description"`
}

func getMibsDir() string {
	// Native V-NMS enterprise MIB repository
	candidates := []string{
		"backend/mibs",
		"mibs",
		"E:/SahProject/V-NMS/backend/mibs",
	}
	for _, p := range candidates {
		if stat, err := os.Stat(p); err == nil && stat.IsDir() {
			return p
		}
	}
	return "backend/mibs"
}

// HandleGetMibsCatalog lists all 116 enterprise MIB files
func HandleGetMibsCatalog(c *gin.Context) {
	dir := getMibsDir()
	entries, err := os.ReadDir(dir)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"mibs":        []MibFileInfo{},
			"total":       0,
			"error":       fmt.Sprintf("MIB directory not accessible: %v", err),
			"catalog_dir": dir,
		})
		return
	}

	search := strings.ToLower(strings.TrimSpace(c.Query("q")))
	vendorFilter := strings.ToLower(strings.TrimSpace(c.Query("vendor")))

	var mibs []MibFileInfo
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}

		name := entry.Name()
		nameLower := strings.ToLower(name)

		// Infer vendor and category
		vendor := "Standard / IETF"
		category := "Core Networking"
		if strings.HasPrefix(nameLower, "cisco") {
			vendor = "Cisco Systems"
			category = "Switching / Routing"
		} else if strings.HasPrefix(nameLower, "aruba") {
			vendor = "Aruba Networks"
			category = "Wireless / Mobility"
		} else if strings.HasPrefix(nameLower, "bgp") || strings.HasPrefix(nameLower, "ospf") || strings.HasPrefix(nameLower, "rip") {
			vendor = "IETF RFC Standard"
			category = "Dynamic Routing"
		} else if strings.HasPrefix(nameLower, "host-resources") || strings.HasPrefix(nameLower, "rmon") {
			vendor = "IETF RFC Standard"
			category = "Host / Systems"
		} else if strings.HasPrefix(nameLower, "advan") || strings.HasPrefix(nameLower, "dell") {
			vendor = "Dell / Advantech"
			category = "Server Hardware"
		}

		if search != "" && !strings.Contains(nameLower, search) && !strings.Contains(strings.ToLower(vendor), search) {
			continue
		}
		if vendorFilter != "" && !strings.Contains(strings.ToLower(vendor), vendorFilter) {
			continue
		}

		mibs = append(mibs, MibFileInfo{
			Name:        name,
			Size:        info.Size(),
			Category:    category,
			Vendor:      vendor,
			Description: fmt.Sprintf("Enterprise MIB definition (%d KB)", info.Size()/1024),
		})
	}

	sort.Slice(mibs, func(i, j int) bool {
		return mibs[i].Name < mibs[j].Name
	})

	c.JSON(http.StatusOK, gin.H{
		"mibs":        mibs,
		"total":       len(mibs),
		"catalog_dir": dir,
	})
}

// HandleGetMibRawContent reads the raw text of a specific MIB file
func HandleGetMibRawContent(c *gin.Context) {
	name := filepath.Base(c.Param("name"))
	dir := getMibsDir()
	fullPath := filepath.Join(dir, name)

	data, err := os.ReadFile(fullPath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "MIB file not found", "file": name})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"name":     name,
		"size":     len(data),
		"content":  string(data),
		"raw_path": fullPath,
	})
}
