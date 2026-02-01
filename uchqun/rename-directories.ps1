# Script to rename directories:
# super-admin -> admin
# admin-panel -> reception

Write-Host "Renaming directories..." -ForegroundColor Yellow
Write-Host ""

# Check if directories exist
if (Test-Path "super-admin") {
    Write-Host "Renaming 'super-admin' to 'admin'..." -ForegroundColor Cyan
    try {
        Rename-Item -Path "super-admin" -NewName "admin" -ErrorAction Stop
        Write-Host "✓ Successfully renamed 'super-admin' to 'admin'" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to rename 'super-admin': $_" -ForegroundColor Red
        Write-Host "  Make sure the directory is not in use (close IDE, dev servers, etc.)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ 'super-admin' directory not found" -ForegroundColor Yellow
}

Write-Host ""

if (Test-Path "admin-panel") {
    Write-Host "Renaming 'admin-panel' to 'reception'..." -ForegroundColor Cyan
    try {
        Rename-Item -Path "admin-panel" -NewName "reception" -ErrorAction Stop
        Write-Host "✓ Successfully renamed 'admin-panel' to 'reception'" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to rename 'admin-panel': $_" -ForegroundColor Red
        Write-Host "  Make sure the directory is not in use (close IDE, dev servers, etc.)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ 'admin-panel' directory not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green



