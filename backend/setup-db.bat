@echo off
REM Database Setup Script for Truck Monitoring System (Windows)
REM This script creates the database, runs migrations, and seeds initial data

echo 🚛 Truck Monitoring System - Database Setup
echo ==============================================

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo 📝 Please edit .env file with your database credentials before continuing.
    echo    Then run this script again.
    pause
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ npm not found. Please install Node.js first.
    pause
    exit /b 1
)

echo 🔄 Installing dependencies...
npm install

echo 🔄 Generating Prisma client...
npx prisma generate

echo 🔄 Running database migrations...
npx prisma migrate dev --name "initial_schema"

echo 🌱 Seeding database with initial data...
npx prisma db seed

echo.
echo ✅ Database setup completed successfully!
echo.
echo 📋 Summary:
echo    - Dependencies installed
echo    - Database created and migrated
echo    - Initial data seeded
echo    - Prisma client generated
echo.
echo 🔐 Test Credentials:
echo    Admin:    admin@truckmonitor.com / SecurePass123!
echo    Manager:  manager@truckmonitor.com / SecurePass123!
echo    Driver 1: driver@truckmonitor.com / SecurePass123!
echo    Driver 2: driver2@truckmonitor.com / SecurePass123!
echo.
echo 🚀 You can now start the development server:
echo    npm run dev
echo.
echo 🔍 To explore the database:
echo    npx prisma studio
echo.
pause
