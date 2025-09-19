#!/bin/bash

# Database Setup Script for Truck Monitoring System
# This script creates the database, runs migrations, and seeds initial data

set -e  # Exit on any error

echo "🚛 Truck Monitoring System - Database Setup"
echo "=============================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your database credentials before continuing."
    echo "   Then run this script again."
    exit 1
fi

# Load environment variables
source .env

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in .env file"
    exit 1
fi

echo "📊 Database URL: ${DATABASE_URL}"

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name "initial_schema"

# Seed the database
echo "🌱 Seeding database with initial data..."
npx prisma db seed

echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "   - Database created and migrated"
echo "   - Initial data seeded"
echo "   - Prisma client generated"
echo ""
echo "🔐 Test Credentials:"
echo "   Admin:    admin@truckmonitor.com / SecurePass123!"
echo "   Manager:  manager@truckmonitor.com / SecurePass123!"
echo "   Driver 1: driver@truckmonitor.com / SecurePass123!"
echo "   Driver 2: driver2@truckmonitor.com / SecurePass123!"
echo ""
echo "🚀 You can now start the development server:"
echo "   npm run dev"
echo ""
echo "🔍 To explore the database:"
echo "   npx prisma studio"
