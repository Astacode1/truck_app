# Truck Monitoring System

A comprehensive truck monitoring system built with modern web technologies.

## Architecture

This is a monorepo containing:

- **Frontend** (`frontend/`): React + TypeScript + Vite + Tailwind CSS
- **Backend** (`backend/`): Node.js + TypeScript + Express + Prisma
- **Infrastructure** (`infra/`): Deployment and infrastructure configurations
- **Documentation** (`docs/`): Project documentation

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (for database)

### Installation

```bash
# Install dependencies for all workspaces
make install

# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### Development

```bash
# Start all services in development mode
make dev

# Or start individual services:
make dev-backend
make dev-frontend
```

### Testing

```bash
# Run all tests
make test

# Run backend tests
make test-backend

# Run frontend tests  
make test-frontend
```

### Building

```bash
# Build all projects
make build

# Build individual projects
make build-backend
make build-frontend
```

## Project Structure

```
truck-monitoring-system/
├── frontend/           # React frontend application
├── backend/            # Node.js backend API
├── infra/              # Infrastructure configurations
├── docs/               # Documentation
├── .github/workflows/  # CI/CD workflows
├── Makefile           # Build automation
└── README.md          # This file
```

## Development Workflow

1. Create feature branches from `main`
2. Make changes and test locally
3. Run linting and tests: `make test`
4. Create pull request
5. Deploy after review and merge

## Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed
4. Ensure CI passes before merging

## License

MIT License - see LICENSE file for details.
