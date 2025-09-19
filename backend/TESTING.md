# Testing Guide

This document provides comprehensive instructions for setting up and running tests for the Truck Monitoring System backend.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

The testing suite includes:
- **Unit Tests**: Test individual functions and services
- **Integration Tests**: Test API endpoints and service interactions
- **End-to-End Tests**: Test complete user workflows

### Test Framework Stack
- **Jest**: Unit and integration testing
- **Supertest**: HTTP API testing
- **Playwright**: End-to-end browser testing
- **TypeScript**: Type safety and development experience

## Prerequisites

### Required Software
1. **Node.js 18+ and npm**
   ```bash
   node --version  # Should be 18.0.0 or higher
   npm --version
   ```

2. **PostgreSQL 15+**
   ```bash
   psql --version  # Should be 15.0 or higher
   ```

3. **Git**
   ```bash
   git --version
   ```

### Optional but Recommended
- **Docker** (for containerized database testing)
- **VS Code** with recommended extensions

## Environment Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone [repository-url]
cd truck-monitoring-system/backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Create test database
createdb truck_monitoring_test

# Set environment variables
export DATABASE_URL="postgresql://username:password@localhost:5432/truck_monitoring_test"
export NODE_ENV="test"
export JWT_SECRET="your-test-jwt-secret"
```

#### Option B: Docker PostgreSQL
```bash
# Start PostgreSQL container
docker run --name postgres-test \
  -e POSTGRES_PASSWORD=test123 \
  -e POSTGRES_USER=testuser \
  -e POSTGRES_DB=truck_monitoring_test \
  -p 5432:5432 \
  -d postgres:15

# Set environment variables
export DATABASE_URL="postgresql://testuser:test123@localhost:5432/truck_monitoring_test"
export NODE_ENV="test"
export JWT_SECRET="your-test-jwt-secret"
```

### 3. Environment Configuration

Create a `.env.test` file:
```env
# Database
DATABASE_URL="postgresql://testuser:test123@localhost:5432/truck_monitoring_test"

# Application
NODE_ENV="test"
JWT_SECRET="test-jwt-secret-key"
PORT=3001

# External Services (use mock values for testing)
AWS_ACCESS_KEY_ID="test"
AWS_SECRET_ACCESS_KEY="test"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="test-bucket"

# OCR Service
GOOGLE_CLOUD_PROJECT_ID="test-project"
GOOGLE_CLOUD_KEY_FILE="path/to/test-service-account.json"

# Email Service
SENDGRID_API_KEY="test-key"
FROM_EMAIL="test@example.com"
```

### 4. Database Migration

```bash
# Run database migrations
npm run migrate

# Optional: Seed with test data
npm run db:seed
```

## Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Type Commands

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# End-to-end tests only
npm run test:e2e

# Run all test types sequentially
npm run test:all

# CI-specific test run (no watch mode)
npm run test:ci
```

### Specific Test Files

```bash
# Run specific test file
npm test src/services/__tests__/auth.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Run integration tests only
npm test -- --testPathPattern=integration
```

### End-to-End Test Options

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Run E2E tests in specific browser
npx playwright test --project=chromium
```

## Test Types

### Unit Tests

Located in `src/**/__tests__/` directories.

**What they test:**
- Individual functions and methods
- Service logic and business rules
- Data transformations
- Error handling

**Example run:**
```bash
npm run test:unit

# Expected output:
# ✓ AuthService login with valid credentials
# ✓ OCRService parses receipt correctly
# ✓ AnomalyRules detects excessive amounts
```

### Integration Tests

Located in `tests/integration/` directory.

**What they test:**
- API endpoint responses
- Database interactions
- Service integrations
- Authentication flows

**Example run:**
```bash
npm run test:integration

# Expected output:
# ✓ POST /api/auth/login returns valid token
# ✓ GET /api/receipts requires authentication
# ✓ Admin can approve receipts
```

### End-to-End Tests

Located in `tests/e2e/` directory.

**What they test:**
- Complete user workflows
- Frontend-backend integration
- Browser interactions
- Multi-step processes

**Example run:**
```bash
npm run test:e2e

# Expected output:
# ✓ Driver can upload receipt
# ✓ Admin can review and approve receipt
# ✓ Complete workflow from upload to approval
```

## Test Data and Fixtures

### Test Users

The test suite creates these default users:

```javascript
// Admin user
{
  email: "admin@test.com",
  password: "password123",
  role: "ADMIN"
}

// Driver user
{
  email: "driver@test.com", 
  password: "password123",
  role: "DRIVER"
}
```

### Test Data Files

- `tests/fixtures/sample-receipt.jpg` - Sample receipt image
- `tests/setup.ts` - Global test configuration
- `tests/integration/setup.ts` - Integration test utilities

## CI/CD Integration

### GitHub Actions

The project includes a comprehensive CI/CD pipeline at `.github/workflows/ci.yml`:

**Pipeline Stages:**
1. **Linting** - Code quality checks
2. **Unit Tests** - Individual component testing
3. **Integration Tests** - API and database testing
4. **E2E Tests** - Browser automation testing
5. **Security Audit** - Dependency vulnerability scanning
6. **Build** - Production build verification

**Triggered by:**
- Push to `main` or `develop` branches
- Pull requests to `main`

### Running CI Tests Locally

```bash
# Simulate CI environment
NODE_ENV=test npm run test:ci

# Run security audit
npm audit --audit-level moderate
```

## Coverage Reports

### Generating Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Current thresholds (defined in `jest.config.js`):
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check database exists
psql -h localhost -U testuser -d truck_monitoring_test -c "SELECT version();"

# Reset database
npm run db:reset
```

#### Permission Errors
```bash
# Fix file permissions
chmod +x node_modules/.bin/jest
chmod +x node_modules/.bin/playwright
```

#### Port Conflicts
```bash
# Check if port 3000/3001 is in use
netstat -an | grep :3000
netstat -an | grep :3001

# Kill processes using ports
killall node
```

#### Test Timeout Issues
```bash
# Increase timeout in jest.config.js
testTimeout: 60000  // 60 seconds

# Or run with increased timeout
npm test -- --testTimeout=60000
```

### Debug Mode

#### Jest Debugging
```bash
# Run Jest in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand src/services/__tests__/auth.service.test.ts
```

#### Playwright Debugging
```bash
# Debug E2E tests
npm run test:e2e:debug

# Run with headed browser
npx playwright test --headed

# Step through tests
npx playwright test --debug
```

### Environment Validation

```bash
# Validate test environment
npm run test -- --detectOpenHandles --forceExit

# Check environment variables
echo $DATABASE_URL
echo $NODE_ENV
echo $JWT_SECRET
```

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**
   ```javascript
   // Arrange
   const user = { email: 'test@example.com', password: 'password' };
   
   // Act
   const result = await authService.login(user);
   
   // Assert
   expect(result).toHaveProperty('token');
   ```

2. **Use Descriptive Test Names**
   ```javascript
   // Good
   test('should return 401 when login with invalid credentials')
   
   // Bad
   test('login test')
   ```

3. **Mock External Dependencies**
   ```javascript
   jest.mock('@aws-sdk/client-s3');
   jest.mock('../services/email.service');
   ```

### Test Data Management

1. **Use Test Factories**
   ```javascript
   const createTestUser = (overrides = {}) => ({
     email: 'test@example.com',
     firstName: 'Test',
     lastName: 'User',
     ...overrides
   });
   ```

2. **Clean Up After Tests**
   ```javascript
   afterEach(async () => {
     await prisma.user.deleteMany();
     await prisma.receipt.deleteMany();
   });
   ```

### Performance

1. **Parallel Test Execution**
   ```bash
   # Run tests in parallel
   npm test -- --maxWorkers=4
   ```

2. **Test Isolation**
   ```javascript
   // Each test should be independent
   beforeEach(() => {
     // Reset state
   });
   ```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

## Support

For testing issues or questions:
1. Check the troubleshooting section above
2. Review test logs and error messages
3. Consult the project documentation
4. Create an issue in the project repository