@echo off
REM Setup script for Truck Monitoring System (Windows)

echo 🚛 Setting up Truck Monitoring System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js detected

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)
echo ✅ Backend dependencies installed successfully

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully

cd ..

REM Setup environment files
echo 🔧 Setting up environment files...

REM Copy backend environment file
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✅ Created backend\.env from template
)

echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Update backend\.env with your database credentials
echo 2. Run 'make dev' to start development servers
echo 3. Backend will be available at http://localhost:3000
echo 4. Frontend will be available at http://localhost:5173

pause
