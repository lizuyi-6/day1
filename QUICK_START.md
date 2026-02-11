# Quick Start Guide - Docker Deployment

## Prerequisites Check

```bash
# Verify Docker is installed
docker --version
# Expected: Docker version 20.10+

# Verify Docker Compose is installed
docker compose version
# Expected: Docker Compose version 2.0+
```

## Setup Steps

### 1. Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your real credentials
# IMPORTANT: Change these values!
DB_USER=your_db_user
DB_PASSWORD=your_secure_password_12_chars
DB_NAME=aether_flow
OPENAI_API_KEY=your_qwen_api_key
```

### 2. Verify Configuration

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File verify-docker-config.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x verify-docker-config.sh
./verify-docker-config.sh
```

### 3. Start Services

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

### 4. Verify Deployment

```bash
# Test backend health
curl http://localhost:3001/health

# Test frontend
curl http://localhost:5173/

# Expected output from health endpoint:
# {
#   "status": "ok",
#   "timestamp": "2025-02-08T12:00:00.000Z",
#   "uptime": 123.456,
#   "environment": "development"
# }
```

## Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Database:** localhost:5432

## Common Commands

```bash
# Stop services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v

# Rebuild and restart
docker compose up -d --build

# View logs for specific service
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Execute command in container
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec db psql -U your_db_user -d aether_flow

# Check resource usage
docker stats
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker compose logs [service_name]

# Check health status
docker inspect --format='{{.State.Health.Status}}' aether_backend
```

### CORS errors
1. Check `ALLOWED_ORIGINS` in `.env`
2. Verify frontend URL matches allowed origin
3. Check backend logs for CORS messages

### Database connection issues
```bash
# Verify database is healthy
docker compose exec db pg_isready -U your_db_user

# Test connection from backend
docker compose exec backend sh
# Then: nc -zv db 5432
```

### Port conflicts
```bash
# Change ports in .env
BACKEND_PORT=3002
FRONTEND_PORT=5174
DB_PORT=5433

# Then restart
docker compose up -d
```

## Development vs Production

### Development Mode (default)
```env
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Production Mode
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
# Use strong passwords!
DB_PASSWORD=very_secure_password_min_12_chars
```

## Updating Services

```bash
# Pull latest changes
git pull

# Rebuild images
docker compose build

# Restart services
docker compose up -d

# Clean up old images
docker image prune -a
```

## Getting Help

- Full documentation: `DOCKER_DEPLOYMENT.md`
- Fix summary: `DOCKER_FIXES_SUMMARY.md`
- Verification scripts: `verify-docker-config.ps1` or `.sh`

## Security Checklist

Before deploying to production:
- [ ] Changed all default passwords
- [ ] Set `NODE_ENV=production`
- [ ] Configured `ALLOWED_ORIGINS` with production domain
- [ ] Enabled TLS/SSL (use nginx/traefik reverse proxy)
- [ ] Set up monitoring and logging
- [ ] Implemented backup strategy
- [ ] Configured firewall rules
- [ ] Regular security updates planned
