# Truck Monitoring System - Test Setup Script (PowerShell)
# This script sets up the testing environment for local development on Windows

param(
    [switch]$SkipDocker,
    [switch]$Help
)

if ($Help) {
    Write-Host "Truck Monitoring System Test Setup"
    Write-Host "Usage: .\setup-testing.ps1 [-SkipDocker] [-Help]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -SkipDocker    Skip Docker database setup"
    Write-Host "  -Help          Show this help message"
    exit 0
}

function Write-Step {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

Write-Host "🚚 Setting up Truck Monitoring System Testing Environment..." -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..."

if (-not (Test-Command "node")) {
    Write-Error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

$nodeVersion = (node --version).TrimStart('v').Split('.')[0]
if ([int]$nodeVersion -lt 18) {
    Write-Error "Node.js version $nodeVersion is too old. Please install Node.js 18+"
    exit 1
}
Write-Step "Node.js $(node --version) is installed"

if (-not (Test-Command "npm")) {
    Write-Error "npm is not installed"
    exit 1
}
Write-Step "npm $(npm --version) is installed"

if (-not (Test-Command "psql")) {
    Write-Warning "PostgreSQL client not found. Make sure PostgreSQL is installed."
    Write-Host "You can also use Docker: docker run --name postgres-test -e POSTGRES_PASSWORD=test123 -e POSTGRES_USER=testuser -e POSTGRES_DB=truck_monitoring_test -p 5432:5432 -d postgres:15"
} else {
    Write-Step "PostgreSQL client is available"
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..."
npm install
Write-Step "Dependencies installed"

# Generate Prisma client
Write-Host "`n🔧 Generating Prisma client..."
npm run db:generate
Write-Step "Prisma client generated"

# Create test environment file
Write-Host "`n🔧 Setting up test environment..."

if (-not (Test-Path ".env.test")) {
    @"
# Test Environment Configuration
DATABASE_URL="postgresql://testuser:test123@localhost:5432/truck_monitoring_test"
NODE_ENV="test"
JWT_SECRET="test-jwt-secret-key-for-development-only"
PORT=3001

# External Services (mock values for testing)
AWS_ACCESS_KEY_ID="test"
AWS_SECRET_ACCESS_KEY="test"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="test-bucket"

# OCR Service
GOOGLE_CLOUD_PROJECT_ID="test-project"

# Email Service
SENDGRID_API_KEY="test-key"
FROM_EMAIL="test@example.com"
"@ | Out-File -FilePath ".env.test" -Encoding UTF8
    Write-Step "Created .env.test file"
} else {
    Write-Warning ".env.test already exists, skipping creation"
}

# Database setup
if (-not $SkipDocker) {
    Write-Host "`n🗄️ Database setup options:"
    Write-Host "1. Use local PostgreSQL"
    Write-Host "2. Use Docker PostgreSQL (recommended)"
    Write-Host "3. Skip database setup"
    
    do {
        $dbOption = Read-Host "Choose option (1-3)"
    } while ($dbOption -notin @("1", "2", "3"))
    
    switch ($dbOption) {
        "1" {
            Write-Host "Setting up local PostgreSQL..."
            $pgUser = Read-Host "Enter PostgreSQL username (default: testuser)"
            if ([string]::IsNullOrEmpty($pgUser)) { $pgUser = "testuser" }
            
            $pgPass = Read-Host "Enter PostgreSQL password (default: test123)"
            if ([string]::IsNullOrEmpty($pgPass)) { $pgPass = "test123" }
            
            Write-Host "Please create the database manually:"
            Write-Host "createdb -U $pgUser truck_monitoring_test"
            Write-Host "Update DATABASE_URL in .env.test if needed"
        }
        "2" {
            Write-Host "Setting up Docker PostgreSQL..."
            if (Test-Command "docker") {
                docker run --name postgres-test `
                    -e POSTGRES_PASSWORD=test123 `
                    -e POSTGRES_USER=testuser `
                    -e POSTGRES_DB=truck_monitoring_test `
                    -p 5432:5432 `
                    -d postgres:15
                Write-Step "Docker PostgreSQL container started"
                
                # Wait for database to be ready
                Write-Host "⏳ Waiting for database to be ready..."
                Start-Sleep -Seconds 5
                
                # Run migrations
                Write-Host "🔄 Running database migrations..."
                $env:DATABASE_URL = "postgresql://testuser:test123@localhost:5432/truck_monitoring_test"
                npm run migrate
                Write-Step "Database migrations completed"
            } else {
                Write-Error "Docker is not installed. Please install Docker or choose option 1"
                exit 1
            }
        }
        "3" {
            Write-Warning "Skipping database setup. Make sure to set up your database manually"
        }
    }
}

# Install Playwright browsers
Write-Host "`n🎭 Installing Playwright browsers..."
npx playwright install
Write-Step "Playwright browsers installed"

# Run a quick test to verify setup
Write-Host "`n🧪 Running setup verification..."

# Test Jest configuration
try {
    npm run test:unit -- --passWithNoTests --silent 2>$null | Out-Null
    Write-Step "Jest configuration is working"
} catch {
    Write-Error "Jest configuration issue detected"
}

# Test database connection (if database was set up)
if ($dbOption -ne "3") {
    $env:DATABASE_URL = "postgresql://testuser:test123@localhost:5432/truck_monitoring_test"
    try {
        npm run test:integration -- --testNamePattern="Health Check" --silent 2>$null | Out-Null
        Write-Step "Database connection is working"
    } catch {
        Write-Warning "Database connection issue - check your database setup"
    }
}

Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Quick start commands:"
Write-Host "  npm test                    # Run all tests"
Write-Host "  npm run test:unit          # Run unit tests only"
Write-Host "  npm run test:integration   # Run integration tests only"
Write-Host "  npm run test:e2e           # Run end-to-end tests only"
Write-Host "  npm run test:coverage      # Run with coverage report"
Write-Host "  npm run test:watch         # Run in watch mode"
Write-Host ""
Write-Host "For more information, see TESTING.md"
Write-Host ""
Write-Host "Happy testing! 🚀" -ForegroundColor Cyan