.PHONY: install dev test build clean lint format help

# Default target
help:
	@echo "Available commands:"
	@echo "  install      - Install dependencies for all workspaces"
	@echo "  dev          - Start development servers for all services"
	@echo "  dev-backend  - Start backend development server"
	@echo "  dev-frontend - Start frontend development server"
	@echo "  test         - Run tests for all workspaces"
	@echo "  test-backend - Run backend tests"
	@echo "  test-frontend- Run frontend tests"
	@echo "  build        - Build all projects"
	@echo "  build-backend- Build backend"
	@echo "  build-frontend- Build frontend"
	@echo "  lint         - Run linting for all workspaces"
	@echo "  format       - Format code in all workspaces"
	@echo "  clean        - Clean all build artifacts"

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "All dependencies installed!"

# Development
dev:
	@echo "Starting all development servers..."
	make dev-backend &
	make dev-frontend &
	wait

dev-backend:
	@echo "Starting backend development server..."
	cd backend && npm run dev

dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

# Testing
test:
	@echo "Running all tests..."
	make test-backend
	make test-frontend

test-backend:
	@echo "Running backend tests..."
	cd backend && npm test

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test

# Building
build:
	@echo "Building all projects..."
	make build-backend
	make build-frontend

build-backend:
	@echo "Building backend..."
	cd backend && npm run build

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

# Code quality
lint:
	@echo "Running linting..."
	cd backend && npm run lint
	cd frontend && npm run lint

format:
	@echo "Formatting code..."
	cd backend && npm run format
	cd frontend && npm run format

# Clean
clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	@echo "Clean completed!"
