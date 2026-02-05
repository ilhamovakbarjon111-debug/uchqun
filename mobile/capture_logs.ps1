# Android Log Capture Script for Uchqun Mobile App
# Captures React Native, Expo, and crash logs

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "mobile_crash_logs_$timestamp.txt"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android Log Capture Started" -ForegroundColor Cyan
Write-Host "Log file: $logFile" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Reproduce the crash now..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop capturing logs" -ForegroundColor Yellow
Write-Host ""

# Clear log buffer first
Write-Host "Clearing log buffer..." -ForegroundColor Gray
adb logcat -c | Out-Null

# Capture logs with filters
# ReactNative:V - All React Native logs
# ReactNativeJS:V - JavaScript logs
# ExpoModules:V - Expo module logs
# Expo:V - Expo framework logs
# AndroidRuntime:E - Runtime errors (crashes)
# *:F - Fatal errors
# chromium:V - WebView logs (for Expo WebView)
# System.err:V - System errors
adb logcat -v time ReactNative:V ReactNativeJS:V ExpoModules:V Expo:V AndroidRuntime:E chromium:V System.err:V *:F | Tee-Object -FilePath $logFile
