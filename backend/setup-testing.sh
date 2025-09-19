#!/bin/bash

# Truck Monitoring System - Test Setup Script
# This script sets up the testing environment for local development

set -e

echo "🚚 Setting up Truck Monitoring System Testing Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18+"
    exit 1
fi
print_step "Node.js $(node --version) is installed"

if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
fi
print_step "npm $(npm --version) is installed"

if ! command_exists psql; then
    print_warning "PostgreSQL client not found. Make sure PostgreSQL is installed."
    echo "You can also use Docker: docker run --name postgres-test -e POSTGRES_PASSWORD=test123 -e POSTGRES_USER=testuser -e POSTGRES_DB=truck_monitoring_test -p 5432:5432 -d postgres:15"
else
    print_step "PostgreSQL client is available"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
print_step "Dependencies installed"

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npm run db:generate
print_step "Prisma client generated"

# Create test environment file
echo ""
echo "🔧 Setting up test environment..."

if [ ! -f ".env.test" ]; then
    cat > .env.test << EOF
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
EOF
    print_step "Created .env.test file"
else
    print_warning ".env.test already exists, skipping creation"
fi

# Database setup options
echo ""
echo "🗄️  Database setup options:"
echo "1. Use local PostgreSQL"
echo "2. Use Docker PostgreSQL (recommended)"
echo "3. Skip database setup"

read -p "Choose option (1-3): " db_option

case $db_option in
    1)
        echo "Setting up local PostgreSQL..."
        read -p "Enter PostgreSQL username (default: testuser): " pg_user
        pg_user=${pg_user:-testuser}
        
        read -p "Enter PostgreSQL password (default: test123): " pg_pass
        pg_pass=${pg_pass:-test123}
        
        echo "Please create the database manually:"
        echo "createdb -U $pg_user truck_monitoring_test"
        echo "Update DATABASE_URL in .env.test if needed"
        ;;
    2)
        echo "Setting up Docker PostgreSQL..."
        if command_exists docker; then
            docker run --name postgres-test \
                -e POSTGRES_PASSWORD=test123 \
                -e POSTGRES_USER=testuser \
                -e POSTGRES_DB=truck_monitoring_test \
                -p 5432:5432 \
                -d postgres:15
            print_step "Docker PostgreSQL container started"
            
            # Wait for database to be ready
            echo "⏳ Waiting for database to be ready..."
            sleep 5
            
            # Run migrations
            echo "🔄 Running database migrations..."
            export DATABASE_URL="postgresql://testuser:test123@localhost:5432/truck_monitoring_test"
            npm run migrate
            print_step "Database migrations completed"
        else
            print_error "Docker is not installed. Please install Docker or choose option 1"
            exit 1
        fi
        ;;
    3)
        print_warning "Skipping database setup. Make sure to set up your database manually"
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

# Install Playwright browsers
echo ""
echo "🎭 Installing Playwright browsers..."
npx playwright install
print_step "Playwright browsers installed"

# Run a quick test to verify setup
echo ""
echo "🧪 Running setup verification..."

# Test Jest configuration
if npm run test:unit -- --passWithNoTests --silent > /dev/null 2>&1; then
    print_step "Jest configuration is working"
else
    print_error "Jest configuration issue detected"
fi

# Test database connection (if database was set up)
if [ "$db_option" != "3" ]; then
    export DATABASE_URL="postgresql://testuser:test123@localhost:5432/truck_monitoring_test"
    if npm run test:integration -- --testNamePattern="Health Check" --silent > /dev/null 2>&1; then
        print_step "Database connection is working"
    else
        print_warning "Database connection issue - check your database setup"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Quick start commands:"
echo "  npm test              # Run all tests"
echo "  npm run test:unit     # Run unit tests only"
echo "  npm run test:integration  # Run integration tests only"
echo "  npm run test:e2e      # Run end-to-end tests only"
echo "  npm run test:coverage # Run with coverage report"
echo "  npm run test:watch    # Run in watch mode"
echo ""
echo "For more information, see TESTING.md"
echo ""
echo "Happy testing! 🚀"