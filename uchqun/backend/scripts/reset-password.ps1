# PowerShell script to help reset PostgreSQL password
# This script provides instructions and attempts to reset the password

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Password Reset Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlPath) {
    Write-Host "✓ psql found at: $($psqlPath.Source)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Attempting to reset password..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You may be prompted for the current password." -ForegroundColor Yellow
    Write-Host "If you don't know it, try:" -ForegroundColor Yellow
    Write-Host "  - Empty password (just press Enter)" -ForegroundColor Yellow
    Write-Host "  - 'postgres' (default)" -ForegroundColor Yellow
    Write-Host "  - Your Windows password" -ForegroundColor Yellow
    Write-Host ""
    
    # Try to reset password
    $resetCommand = "ALTER USER postgres WITH PASSWORD 'postgres';"
    
    Write-Host "Run this command:" -ForegroundColor Cyan
    Write-Host "psql -U postgres -c `"$resetCommand`"" -ForegroundColor White
    Write-Host ""
    
    $run = Read-Host "Do you want to run this now? (y/n)"
    if ($run -eq 'y' -or $run -eq 'Y') {
        try {
            & psql -U postgres -c $resetCommand
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✓ Password reset successful!" -ForegroundColor Green
                Write-Host "You can now run: npm run seed" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "✗ Password reset failed. You may need to:" -ForegroundColor Red
                Write-Host "  1. Use pgAdmin to reset the password" -ForegroundColor Yellow
                Write-Host "  2. Update .env with your actual password" -ForegroundColor Yellow
            }
        } catch {
            Write-Host ""
            Write-Host "Error: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✗ psql not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Method 1: Use pgAdmin" -ForegroundColor Cyan
    Write-Host "  1. Open pgAdmin" -ForegroundColor White
    Write-Host "  2. Connect to your PostgreSQL server" -ForegroundColor White
    Write-Host "  3. Right-click 'Login/Group Roles' → 'postgres' → 'Properties'" -ForegroundColor White
    Write-Host "  4. Go to 'Definition' tab" -ForegroundColor White
    Write-Host "  5. Set password to 'postgres'" -ForegroundColor White
    Write-Host "  6. Click 'Save'" -ForegroundColor White
    Write-Host ""
    Write-Host "Method 2: Update .env file" -ForegroundColor Cyan
    Write-Host "  1. Open backend/.env" -ForegroundColor White
    Write-Host "  2. Find DB_PASSWORD=postgres" -ForegroundColor White
    Write-Host "  3. Replace 'postgres' with your actual PostgreSQL password" -ForegroundColor White
    Write-Host "  4. Save the file" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "After fixing the password, test connection:" -ForegroundColor Cyan
Write-Host "  npm run test:db" -ForegroundColor White
Write-Host ""



