# 📱 Android Log Capture Guide

## Quick Start

### Option 1: Use the PowerShell Script (Recommended)
```powershell
cd uchqun\mobile
.\capture_logs.ps1
```
Then reproduce the crash. Press `Ctrl+C` to stop and save logs.

### Option 2: Manual Command
```powershell
cd uchqun\mobile
adb logcat -c
adb logcat -v time ReactNative:V ReactNativeJS:V ExpoModules:V Expo:V AndroidRuntime:E chromium:V System.err:V *:F > crash_logs.txt
```
Reproduce the crash, then press `Ctrl+C` to stop.

### Option 3: Capture Everything (Full Logs)
```powershell
cd uchqun\mobile
.\capture_logs_simple.ps1
```

## What Gets Captured

- **ReactNative:V** - All React Native framework logs
- **ReactNativeJS:V** - JavaScript console logs and errors
- **ExpoModules:V** - Expo module logs
- **Expo:V** - Expo framework logs
- **AndroidRuntime:E** - App crashes and runtime errors
- **chromium:V** - WebView logs (for Expo WebView screens)
- **System.err:V** - System error messages
- ***:F** - All fatal errors

## Log File Location

Logs are saved in the `mobile` directory with timestamp:
- `mobile_crash_logs_YYYYMMDD_HHMMSS.txt`

## Analyzing Logs

Look for:
1. **FATAL EXCEPTION** - App crashes
2. **AndroidRuntime** - Runtime errors
3. **ReactNativeJS** - JavaScript errors
4. **Error:** or **Exception:** - Error messages
5. Stack traces starting with `at`

## Common Issues

### Device Not Found
```powershell
adb devices
```
Make sure USB debugging is enabled and device is authorized.

### No Logs Appearing
- Check if app is actually running
- Try capturing all logs: `adb logcat > all_logs.txt`
- Verify device connection: `adb devices`
