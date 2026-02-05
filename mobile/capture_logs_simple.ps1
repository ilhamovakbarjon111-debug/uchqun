# Simple Android Log Capture - All logs
# Use this if you want to capture everything

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "mobile_crash_logs_full_$timestamp.txt"

Write-Host "Capturing ALL Android logs to: $logFile" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

adb logcat -c | Out-Null
adb logcat -v time > $logFile
