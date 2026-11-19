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

# Ensure VNMSProxy scheduled task exists without duplicate service creation
$taskName = "VNMSProxy"
$proxyExe = "C:\Program Files\V-NMS\vnms-proxy.exe"
if (Test-Path $proxyExe) {
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if (-not $existingTask) {
        $action = New-ScheduledTaskAction -Execute $proxyExe
        $trigger = New-ScheduledTaskTrigger -AtStartup
        $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Force -ErrorAction SilentlyContinue | Out-Null
        Start-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    }
}


