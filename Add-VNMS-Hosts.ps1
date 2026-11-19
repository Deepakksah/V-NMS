# ============================================================
# V-NMS Enterprise NOC - Network Hosts Setup Script
# Run this on EACH PC in the network (as Administrator)
# After running: open http://V-NMS-Dashboard.com:8081
# ============================================================

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$serverIP  = "172.168.1.100"  # V-NMS virtual IP (port 80 proxy)

$entries = @(
    "",
    "# V-NMS Enterprise NOC Dashboard",
    "$serverIP  V-NMS-Dashboard.com",
    "$serverIP  www.V-NMS-Dashboard.com",
    "$serverIP  vnms-dashboard.com"
)

$current = Get-Content $hostsPath -Raw

if ($current -match "V-NMS-Dashboard") {
    Write-Host "[INFO] Hosts entry already exists. Skipping." -ForegroundColor Yellow
} else {
    Add-Content -Path $hostsPath -Value ($entries -join "`r`n")
    Write-Host "[OK] Hosts entry added successfully!" -ForegroundColor Green
}

# Flush DNS cache
ipconfig /flushdns | Out-Null
Write-Host "[OK] DNS cache flushed." -ForegroundColor Green
Write-Host ""
Write-Host "Open in browser: http://V-NMS-Dashboard.com  (no port needed!)" -ForegroundColor Cyan
Write-Host ""

# Quick test
try {
    $r = Invoke-WebRequest "http://V-NMS-Dashboard.com" -UseBasicParsing -TimeoutSec 5
    Write-Host "[SUCCESS] Dashboard reachable! HTTP $($r.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Could not reach dashboard. Check firewall or VNMSService." -ForegroundColor Red
}

