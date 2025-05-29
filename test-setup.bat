@echo off
echo Testing Node.js application...
cd /d "e:\AIRBNB\Airbnb"

echo.
echo Current directory:
cd

echo.
echo Node.js version:
node --version

echo.
echo Checking package.json:
if exist package.json (
    echo ✅ package.json found
) else (
    echo ❌ package.json not found
)

echo.
echo Checking app.js:
if exist app.js (
    echo ✅ app.js found
) else (
    echo ❌ app.js not found
)

echo.
echo Checking node_modules:
if exist node_modules (
    echo ✅ node_modules found
) else (
    echo ❌ node_modules not found - running npm install...
    npm install
)

echo.
echo Testing app.js syntax...
node -c app.js
if errorlevel 1 (
    echo ❌ Syntax errors found in app.js
) else (
    echo ✅ app.js syntax is correct
)

echo.
echo Test complete.
pause
