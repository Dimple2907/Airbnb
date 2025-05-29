@echo off
title Wanderlust - Airbnb Clone
color 0A

echo.
echo ========================================
echo    WANDERLUST - AIRBNB CLONE SETUP
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

echo.
echo Checking npm dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm install
) else (
    echo ✅ Dependencies already installed
)

echo.
echo ========================================
echo    DATABASE SETUP OPTIONS
echo ========================================
echo.
echo Choose your database setup:
echo 1. Use MongoDB Atlas (Cloud) - Recommended
echo 2. Install MongoDB locally
echo 3. Try to start without database (limited functionality)
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Opening MongoDB Atlas setup guide...
    start MONGODB_ATLAS_SETUP.md
    echo.
    echo After setting up Atlas:
    echo 1. Update the ATLASDB_URL in .env file
    echo 2. Run this script again or use: npm start
    pause
    exit /b 0
)

if "%choice%"=="2" (
    echo.
    echo Please install MongoDB Community Server:
    echo 1. Go to: https://www.mongodb.com/try/download/community
    echo 2. Download and install MongoDB
    echo 3. Ensure MongoDB service is running
    echo 4. Run this script again or use: npm start
    pause
    exit /b 0
)

if "%choice%"=="3" (
    echo.
    echo ⚠️  Starting without database connection...
    echo Some features may not work properly.
    echo.
)

echo.
echo ========================================
echo    STARTING APPLICATION
echo ========================================
echo.
echo Starting Wanderlust server...
echo Open your browser to: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

npm start
