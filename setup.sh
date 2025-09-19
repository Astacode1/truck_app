#!/bin/bash

# Setup script for Truck Monitoring System
echo "🚛 Setting up Truck Monitoring System..."

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
  echo "❌ Node.js is not installed. Please install Node.js 18+ first."
  exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! npx semver $NODE_VERSION --range ">=$REQUIRED_VERSION" >/dev/null 2>&1; then
  echo "❌ Node.js version $NODE_VERSION is not supported. Please upgrade to Node.js 18+."
  exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if npm install; then
  echo "✅ Backend dependencies installed successfully"
else
  echo "❌ Failed to install backend dependencies"
  exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
if npm install; then
  echo "✅ Frontend dependencies installed successfully"
else
  echo "❌ Failed to install frontend dependencies"
  exit 1
fi

cd ..

# Setup environment files
echo "🔧 Setting up environment files..."

# Copy backend environment file
if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo "✅ Created backend/.env from template"
fi

echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run 'make dev' to start development servers"
echo "3. Backend will be available at http://localhost:3000"
echo "4. Frontend will be available at http://localhost:5173"
