# Docker Deployment Guide

## Prerequisites

1. **Docker Engine 20.10+** and **Docker Compose 2.0+** installed
2. Git repository cloned locally
3. Environment variables configured (see `.env.example`)

## Security Configuration

### 1. Environment Variables Setup

Copy the example environment file and configure with your real credentials:

```bash
cp .env.example .env
```

**REQUIRED Variables (no defaults provided for security):**
- `DB_USER` - Database username
- `DB_PASSWORD` - Strong database password (min 12 characters)
- `DB_NAME` - Database name
- `OPENAI_API_KEY` - Your Qwen API key

**OPTIONAL Variables (with safe defaults):**
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)
- `BACKEND_PORT` - Backend port (default: 3001)
- `FRONTEND_PORT` - Frontend port (default: 5173)

## Docker Configuration Features

### Backend Dockerfile (Multi-Stage Build)

**Three-stage build:**
1. **dependencies** - Installs all dependencies
2. **build** - Compiles TypeScript to JavaScript
3. **production** - Minimal production image with only production dependencies

**Security features:**
- Non-root user (nodejs:1001)
- Minimal attack surface
- Health checks enabled
- Proper signal handling with dumb-init
- Only production dependencies in final image

### Frontend Dockerfile (Multi-Stage Build)

**Three-stage build:**
1. **dependencies** - Installs all dependencies
2. **build** - Builds Vue application
3. **production** - Serves production build

**Security features:**
- Non-root user (nodejs:1001)
- Optimized production builds
- Health checks enabled

### Docker Compose Configuration

**Security improvements:**
- ✅ **No default passwords** - Must be set in `.env`
- ✅ Custom network isolation
- ✅ Health checks for all services
- ✅ Proper service dependencies
- ✅ Restart policies configured

**Service configuration:**
```yaml
services:
  db:          # PostgreSQL 15
  backend:     # NestJS API
  frontend:    # Vue.js SPA
```

## Deployment Steps

### Development Mode

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production Mode

1. **Update environment variables for production:**
```bash
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

2. **Build production images:**
```bash
# Build backend (production stage)
docker build --target production -t aether-backend:prod ./backend

# Build frontend (production stage)
docker build --target production -t aether-frontend:prod ./frontend
```

3. **Deploy with production images:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Health Checks

All services include health checks:

**Database:**
```bash
docker exec aether_db pg_isready -U your_db_user
```

**Backend:**
```bash
curl http://localhost:3001/health
```

**Frontend:**
```bash
curl http://localhost:5173/
```

## CORS Configuration

CORS is configured via the `ALLOWED_ORIGINS` environment variable:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://yourdomain.com
```

**Features:**
- Comma-separated list of allowed origins
- Supports multiple domains
- Credentials enabled
- Proper preflight handling
- 1-hour cache for preflight requests

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check health status
docker-compose ps
```

### CORS errors

1. Verify `ALLOWED_ORIGINS` includes your frontend URL
2. Check backend logs for CORS rejection messages
3. Ensure origin matches exactly (protocol, domain, port)

### Database connection issues

1. Verify database health check passes
2. Check `DB_USER`, `DB_PASSWORD`, `DB_NAME` match
3. Ensure backend waits for db health check:
```yaml
depends_on:
  db:
    condition: service_healthy
```

### Permission issues (non-root user)

If you encounter permission errors, ensure proper file ownership:

```bash
# For local development with volumes
docker-compose exec frontend chown -R nodejs:nodejs /app
docker-compose exec backend chown -R nodejs:nodejs /app
```

## Production Recommendations

1. **Use secrets management** (Docker Secrets, Vault, etc.)
2. **Enable TLS/SSL** with reverse proxy (nginx/traefik)
3. **Implement log aggregation** (ELK, Loki, etc.)
4. **Set up monitoring** (Prometheus, Grafana)
5. **Regular security updates** for base images
6. **Scan images for vulnerabilities** (trivy, snyk)
7. **Implement rate limiting** (nginx, API Gateway)
8. **Backup database** regularly

## Verification

After deployment, verify all services:

```bash
# 1. Check all containers running
docker-compose ps

# 2. Verify health status
docker inspect --format='{{.State.Health.Status}}' aether_backend
docker inspect --format='{{.State.Health.Status}}' aether_frontend

# 3. Test health endpoints
curl http://localhost:3001/health
curl http://localhost:5173/

# 4. Test API connectivity
curl http://localhost:3001/api/workflows
```

## Maintenance

### Update images

```bash
# Rebuild and restart
docker-compose up -d --build

# Pull latest base images
docker pull node:20-alpine
docker pull postgres:15-alpine
```

### Clean up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes (WARNING: deletes data)
docker volume prune
```

## Additional Resources

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [NestJS Production Deployment](https://docs.nestjs.com/faq/production)
- [Vue.js Production Deployment](https://vuejs.org/guide/best-practices/production-deployment.html)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
