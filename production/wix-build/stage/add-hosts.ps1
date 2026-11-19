# V-NMS Hosts File Setup
# Runs automatically during installation
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$serverIP  = "172.168.1.100"
$entries = @(
    "",
    "# V-NMS Enterprise NOC Dashboard",
    "$serverIP  V-NMS-Dashboard.com",
    "$serverIP  www.V-NMS-Dashboard.com",
    "$serverIP  vnms-dashboard.com"
)
$current = Get-Content $hostsPath -Raw -ErrorAction SilentlyContinue
if ($current -notmatch "V-NMS-Dashboard") {
    Add-Content -Path $hostsPath -Value ($entries -join "`r`n")
}
ipconfig /flushdns | Out-Null

