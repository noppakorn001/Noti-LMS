@echo off
title Push Noti-LMS to GitHub
echo ===================================================
echo Pushing Noti-LMS to GitHub...
echo ===================================================

REM Define git path since it's not in the system PATH
set GIT_PATH="C:\Program Files\Git\cmd\git.exe"

if not exist %GIT_PATH% (
    echo Error: Git was not found at %GIT_PATH%.
    echo Please make sure Git is installed.
    pause
    exit /b 1
)

echo.
echo Checking Git status...
%GIT_PATH% status

echo.
echo Staging changes (git add .)...
%GIT_PATH% add .

echo.
echo Committing changes...
set /p commit_msg="Enter commit message (or press Enter for 'Update project files'): "
if "%commit_msg%"=="" set commit_msg=Update project files

%GIT_PATH% commit -m "%commit_msg%"

echo.
echo Pushing to GitHub (main branch)...
%GIT_PATH% push -u origin main

echo.
echo ===================================================
echo Done!
echo ===================================================
pause
