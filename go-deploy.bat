@echo off
rem Simple script for deployment to Cloudflare Pages
rem Author: egoro

echo Starting deployment to Cloudflare Pages...
echo.

if exist cloudflare-deploy.ps1 (
    powershell -ExecutionPolicy Bypass -File .\cloudflare-deploy.ps1
) else (
    echo Error: File cloudflare-deploy.ps1 not found!
    exit /b 1
)

echo.
echo Press any key to exit...
pause > nul