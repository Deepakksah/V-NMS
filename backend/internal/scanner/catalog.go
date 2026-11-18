package scanner

import (
	_ "embed"
	"encoding/json"
	"strings"
	"sync"
)

//go:embed device_templates_full.json
var embeddedTemplatesJSON []byte

//go:embed enterprise_monitors.json
var embeddedMonitorsJSON []byte

type DeviceTemplateItem struct {
	DeviceType    string   `json:"device_type"`
	SysOID        string   `json:"sys_oid"`
	AllSysOIDs    []string `json:"all_sysoids,omitempty"`
	Category      string   `json:"category"`
	Vendor        string   `json:"vendor"`
	IconName      string   `json:"icon_name"`
	DefaultGraphs []string `json:"default_graphs"`
	PingInterval  int      `json:"ping_interval"`
}

type EnterpriseMonitorItem struct {
	Name        string `json:"name"`
	GraphName   string `json:"graph_name"`
	OID         string `json:"oid"`
	Protocol    string `json:"protocol"`
	Vendor      string `json:"vendor"`
	Unit        string `json:"unit"`
	Description string `json:"description"`
}

type CatalogStore struct {
	templates  []DeviceTemplateItem
	monitors   []EnterpriseMonitorItem
	vendors    []string
	categories []string
	once       sync.Once
}

var globalCatalog CatalogStore

func initCatalog() {
	globalCatalog.once.Do(func() {
		// Load templates
		var rawTemplates []DeviceTemplateItem
		if err := json.Unmarshal(embeddedTemplatesJSON, &rawTemplates); err == nil {
			globalCatalog.templates = rawTemplates
		}

		// Load monitors
		var rawMonitors []EnterpriseMonitorItem
		if err := json.Unmarshal(embeddedMonitorsJSON, &rawMonitors); err == nil {
			globalCatalog.monitors = rawMonitors
		}

		// Extract unique vendors and categories
		vMap := make(map[string]bool)
		cMap := make(map[string]bool)
		for _, t := range globalCatalog.templates {
			if t.Vendor != "" {
				vMap[t.Vendor] = true
			}
			if t.Category != "" {
				cMap[t.Category] = true
			}
		}
		for v := range vMap {
			globalCatalog.vendors = append(globalCatalog.vendors, v)
		}
		for c := range cMap {
			globalCatalog.categories = append(globalCatalog.categories, c)
		}
	})
}

// SearchTemplates filters templates by free-text, vendor, and category
func SearchTemplates(q, vendor, category string, limit, offset int) (results []DeviceTemplateItem, total int, allVendors []string, allCategories []string) {
	initCatalog()

	q = strings.ToLower(strings.TrimSpace(q))
	vendor = strings.ToLower(strings.TrimSpace(vendor))
	category = strings.ToLower(strings.TrimSpace(category))

	var filtered []DeviceTemplateItem
	for _, t := range globalCatalog.templates {
		if vendor != "" && strings.ToLower(t.Vendor) != vendor && !strings.Contains(strings.ToLower(t.Vendor), vendor) {
			continue
		}
		if category != "" && strings.ToLower(t.Category) != category {
			continue
		}
		if q != "" {
			match := strings.Contains(strings.ToLower(t.DeviceType), q) ||
				strings.Contains(strings.ToLower(t.Vendor), q) ||
				strings.Contains(strings.ToLower(t.Category), q) ||
				strings.Contains(t.SysOID, q)
			if !match {
				continue
			}
		}
		filtered = append(filtered, t)
	}

	total = len(filtered)
	if limit <= 0 {
		limit = 50
	}
	if limit > 500 {
		limit = 500
	}
	if offset < 0 {
		offset = 0
	}

	end := offset + limit
	if offset > total {
		results = []DeviceTemplateItem{}
	} else {
		if end > total {
			end = total
		}
		results = filtered[offset:end]
	}

	return results, total, globalCatalog.vendors, globalCatalog.categories
}

// SearchMonitors filters performance monitors by free-text, vendor, and protocol
func SearchMonitors(q, vendor, protocol string, limit, offset int) (results []EnterpriseMonitorItem, total int) {
	initCatalog()

	q = strings.ToLower(strings.TrimSpace(q))
	vendor = strings.ToLower(strings.TrimSpace(vendor))
	protocol = strings.ToLower(strings.TrimSpace(protocol))

	var filtered []EnterpriseMonitorItem
	for _, m := range globalCatalog.monitors {
		if vendor != "" && !strings.Contains(strings.ToLower(m.Vendor), vendor) {
			continue
		}
		if protocol != "" && strings.ToLower(m.Protocol) != protocol {
			continue
		}
		if q != "" {
			match := strings.Contains(strings.ToLower(m.Name), q) ||
				strings.Contains(strings.ToLower(m.Description), q) ||
				strings.Contains(strings.ToLower(m.Vendor), q) ||
				strings.Contains(m.OID, q)
			if !match {
				continue
			}
		}
		filtered = append(filtered, m)
	}

	total = len(filtered)
	if limit <= 0 {
		limit = 50
	}
	if limit > 200 {
		limit = 200
	}
	if offset < 0 {
		offset = 0
	}

	end := offset + limit
	if offset > total {
		results = []EnterpriseMonitorItem{}
	} else {
		if end > total {
			end = total
		}
		results = filtered[offset:end]
	}

	return results, total
}

// GetCatalogStats returns summary counts of imported data
func GetCatalogStats() (totalTemplates int, totalMonitors int, totalVendors int, totalCategories int) {
	initCatalog()
	return len(globalCatalog.templates), len(globalCatalog.monitors), len(globalCatalog.vendors), len(globalCatalog.categories)
}
