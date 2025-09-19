# Deployment Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

## Backend Deployment

1. Build the application:
```bash
cd backend
npm run build
```

2. Set environment variables:
```bash
export NODE_ENV=production
export DATABASE_URL="your-production-database-url"
export JWT_SECRET="your-secure-jwt-secret"
```

3. Run database migrations:
```bash
npm run db:migrate
```

4. Start the server:
```bash
npm start
```

## Frontend Deployment

1. Build the application:
```bash
cd frontend
npm run build
```

2. Serve the static files using a web server (nginx, Apache, etc.)

## Docker Deployment

Create `docker-compose.yml` for containerized deployment.

## Infrastructure

The `infra/` directory should contain:
- Terraform configurations
- Kubernetes manifests
- Docker configurations
- CI/CD pipeline definitions
