@echo off
title Build and Deploy Noti-LMS to Cloudflare
echo ===================================================
echo Preparing Noti-LMS Cloudflare Build...
echo ===================================================

call npm run build:cf
if %ERRORLEVEL% neq 0 (
    echo.
    echo Error: Build failed! Please check compile errors above.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo Deploying to Cloudflare Workers...
echo ===================================================

call npx wrangler deploy
if %ERRORLEVEL% neq 0 (
    echo.
    echo Error: Cloudflare deployment failed!
    echo Please make sure you are logged into Wrangler (run: npx wrangler login)
    pause
    exit /b 1
)

echo.
echo ===================================================
echo Deployment Successful!
echo ===================================================
pause
