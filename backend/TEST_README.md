# 🧪 Testing Setup - Quick Start

## One-Command Setup

### Windows (PowerShell)
```powershell
.\setup-testing.ps1
```

### Linux/macOS (Bash)
```bash
chmod +x setup-testing.sh
./setup-testing.sh
```

## Manual Setup (If scripts don't work)

1. **Install dependencies**
   ```bash
   npm install
   npm run db:generate
   ```

2. **Setup database**
   ```bash
   # Option A: Docker (recommended)
   docker run --name postgres-test -e POSTGRES_PASSWORD=test123 -e POSTGRES_USER=testuser -e POSTGRES_DB=truck_monitoring_test -p 5432:5432 -d postgres:15
   
   # Option B: Local PostgreSQL
   createdb truck_monitoring_test
   ```

3. **Create .env.test**
   ```env
   DATABASE_URL="postgresql://testuser:test123@localhost:5432/truck_monitoring_test"
   NODE_ENV="test"
   JWT_SECRET="test-jwt-secret"
   ```

4. **Run migrations**
   ```bash
   npm run migrate
   ```

5. **Install Playwright**
   ```bash
   npx playwright install
   ```

## Run Tests

```bash
# All tests
npm test

# Specific test types
npm run test:unit           # Unit tests
npm run test:integration    # API tests  
npm run test:e2e           # Browser tests

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Need Help?

See the complete [Testing Guide](./TESTING.md) for detailed instructions, troubleshooting, and best practices.