# Simple script for deployment to Cloudflare Pages
# Author: egoro
# Run: .\go-deploy.ps1

Write-Host "Starting deployment to Cloudflare Pages..." -ForegroundColor Cyan
Write-Host ""

# Check if the deployment script exists
if (Test-Path -Path ".\cloudflare-deploy.ps1") {
    # Run the deployment script
    & ".\cloudflare-deploy.ps1"
} else {
    Write-Host "Error: File cloudflare-deploy.ps1 not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Operation completed." -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 