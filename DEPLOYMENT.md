# Deployment Guide

This guide covers deployment options for the Truck Monitoring System using Docker containers and CI/CD pipelines.

## Quick Start

### Local Development with Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd truck-monitoring-system

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database: localhost:5432

### Production Build

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or build individual services
docker build -t truck-monitoring-backend:latest ./backend --target production
docker build -t truck-monitoring-frontend:latest ./frontend --target production
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Tests**: Runs unit, integration, and E2E tests
2. **Security**: Scans for vulnerabilities with Trivy
3. **Build**: Creates Docker images tagged with commit SHA
4. **Deploy**: Deploys to development/production environments

### Required Secrets

Add these secrets to your GitHub repository:

#### AWS Deployment
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_SUBNET_IDS=subnet-12345,subnet-67890
AWS_SECURITY_GROUP_ID=sg-12345
```

#### DigitalOcean Deployment
```
DIGITALOCEAN_ACCESS_TOKEN=your-do-token
```

#### Application Secrets
```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-jwt-secret-key
REDIS_URL=redis://host:6379
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## Deployment Platforms

### 1. AWS ECS Fargate

#### Prerequisites
- AWS Account with ECS permissions
- ECS Cluster created
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- Application Load Balancer
- Route 53 domain (optional)

#### Setup Steps

1. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name truck-monitoring-cluster
   ```

2. **Create Task Definitions**
   ```bash
   aws ecs register-task-definition --cli-input-json file://deployment/aws/backend-task-definition.json
   aws ecs register-task-definition --cli-input-json file://deployment/aws/frontend-task-definition.json
   ```

3. **Create Services**
   ```bash
   aws ecs create-service \
     --cluster truck-monitoring-cluster \
     --service-name truck-monitoring-backend \
     --task-definition truck-monitoring-backend \
     --desired-count 2 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
   ```

4. **Configure Load Balancer**
   - Create target groups for backend (port 3000) and frontend (port 80)
   - Configure health checks
   - Add listener rules for routing

#### Environment Variables
Set these in AWS Secrets Manager:
- `truck-monitoring/database-url`
- `truck-monitoring/jwt-secret`
- `truck-monitoring/redis-url`

#### Scaling Configuration
```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/truck-monitoring-cluster/truck-monitoring-backend \
  --min-capacity 1 \
  --max-capacity 10
```

### 2. DigitalOcean App Platform

#### Prerequisites
- DigitalOcean Account
- GitHub repository connected
- Database cluster created

#### Setup Steps

1. **Deploy via CLI**
   ```bash
   doctl apps create --spec deployment/digitalocean/app.yaml
   ```

2. **Or Deploy via Web Console**
   - Go to Apps section in DO console
   - Connect GitHub repository
   - Configure build settings
   - Add environment variables

#### Environment Variables
Configure in DO App Platform:
- `DATABASE_URL`: Connection string from managed database
- `JWT_SECRET`: Random secure string
- `REDIS_URL`: Redis connection string

### 3. Self-Hosted with Docker Compose

#### Prerequisites
- Ubuntu 20.04+ server
- Docker and Docker Compose installed
- Domain name pointing to server
- SSL certificate (Let's Encrypt recommended)

#### Setup Steps

1. **Server Preparation**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd truck-monitoring-system

   # Create environment file
   cp .env.example .env
   # Edit .env with production values

   # Start services
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **SSL Setup with Nginx**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx

   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

## Monitoring

### Health Checks

All services include health check endpoints:
- Backend: `GET /health`
- Frontend: `GET /health`
- Database: Built-in PostgreSQL health check

### Logging

Logs are centralized using:
- **AWS**: CloudWatch Logs
- **DigitalOcean**: Built-in logging
- **Self-hosted**: Docker logs with log rotation

### Metrics

Optional monitoring stack with Prometheus and Grafana:
```bash
# Start monitoring services
docker-compose --profile monitoring up -d

# Access Grafana
open http://localhost:3001
# Default credentials: admin/admin
```

## Database Management

### Migrations

Migrations run automatically during deployment via:
```bash
npm run db:deploy
```

### Backups

#### AWS RDS
- Automated backups enabled by default
- Point-in-time recovery available

#### DigitalOcean
- Automated daily backups
- Manual backup creation available

#### Self-hosted
```bash
# Create backup
docker-compose exec postgres pg_dump -U truck_user truck_monitoring > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U truck_user truck_monitoring < backup.sql
```

## Security

### Container Security
- Non-root user in containers
- Minimal base images (Alpine Linux)
- Regular security updates
- Vulnerability scanning with Trivy

### Network Security
- Private subnets for backend services
- Security groups restricting access
- SSL/TLS encryption
- CORS configuration

### Secrets Management
- Environment variables for configuration
- AWS Secrets Manager for sensitive data
- No secrets in Docker images or Git repository

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database connectivity
   docker-compose exec backend npm run db:check
   
   # View database logs
   docker-compose logs postgres
   ```

2. **Container Health Check Failures**
   ```bash
   # Check container status
   docker-compose ps
   
   # View container logs
   docker-compose logs <service-name>
   
   # Inspect container
   docker inspect <container-name>
   ```

3. **Build Failures**
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild specific service
   docker-compose build --no-cache <service-name>
   ```

### Performance Tuning

1. **Database Optimization**
   - Configure connection pooling
   - Add database indexes
   - Monitor query performance

2. **Container Resources**
   - Adjust CPU and memory limits
   - Configure health check intervals
   - Optimize Docker layer caching

3. **Application Optimization**
   - Enable gzip compression
   - Configure CDN for static assets
   - Implement caching strategies

## Rollback Procedures

### AWS ECS
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster truck-monitoring-cluster \
  --service truck-monitoring-backend \
  --task-definition truck-monitoring-backend:1
```

### DigitalOcean
- Use the App Platform console to deploy previous version
- Or redeploy specific commit SHA through GitHub

### Self-hosted
```bash
# Switch to previous image tags
docker-compose down
# Edit docker-compose.yml with previous image tags
docker-compose up -d
```

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment variables
4. Check network connectivity
5. Contact system administrators