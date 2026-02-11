# Deployment Checklist - Docker & CORS Configuration Fixes

## Pre-Deployment Verification

### Environment Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `DB_USER` set with secure username
- [ ] `DB_PASSWORD` set with strong password (min 12 characters)
- [ ] `DB_NAME` configured
- [ ] `OPENAI_API_KEY` set with valid Qwen API key
- [ ] `ALLOWED_ORIGINS` configured with correct frontend URLs
- [ ] `NODE_ENV` set appropriately (development/production)

### Docker Configuration
- [ ] `backend/Dockerfile` uses multi-stage build
- [ ] `frontend/Dockerfile` uses multi-stage build
- [ ] Both Dockerfiles create non-root user (nodejs:1001)
- [ ] Both Dockerfiles include health checks
- [ ] `docker-compose.yml` has no default passwords
- [ ] `docker-compose.yml` includes custom network
- [ ] `docker-compose.yml` has health checks for all services
- [ ] `docker-compose.yml` has proper service dependencies

### CORS Configuration
- [ ] `backend/src/main.ts` uses `ALLOWED_ORIGINS` environment variable
- [ ] CORS credentials enabled
- [ ] CORS maxAge configured (3600 seconds)
- [ ] Health check endpoint exists at `/health`

## Pre-Deployment Testing

### Configuration Validation
- [ ] Run `verify-docker-config.ps1` (Windows) or `verify-docker-config.sh` (Linux/Mac)
- [ ] All checks pass without errors
- [ ] Docker and Docker Compose versions compatible

### Local Testing
- [ ] `docker compose config` executes successfully
- [ ] `docker compose up -d` starts all services
- [ ] All containers show "healthy" status
- [ ] Backend health endpoint returns 200 OK
- [ ] Frontend loads successfully
- [ ] No CORS errors in browser console
- [ ] Backend can connect to database
- [ ] Frontend can connect to backend API

## Deployment Steps

### Development Deployment
```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 2. Verify configuration
powershell -ExecutionPolicy Bypass -File verify-docker-config.ps1

# 3. Start services
docker compose up -d

# 4. Monitor logs
docker compose logs -f

# 5. Verify health
curl http://localhost:3001/health
curl http://localhost:5173/
```

### Production Deployment
```bash
# 1. Set production environment
NODE_ENV=production

# 2. Configure production origins
ALLOWED_ORIGINS=https://yourdomain.com

# 3. Use strong passwords
DB_PASSWORD=very_secure_password_min_12_chars

# 4. Build production images
docker build --target production -t aether-backend:prod ./backend
docker build --target production -t aether-frontend:prod ./frontend

# 5. Deploy
docker compose up -d

# 6. Verify
docker compose ps
docker compose logs -f
```

## Post-Deployment Verification

### Service Health Checks
- [ ] Database container healthy
- [ ] Backend container healthy
- [ ] Frontend container healthy
- [ ] All services running (not restarting)

### Functional Testing
- [ ] Backend `/health` endpoint accessible
- [ ] Frontend loads without errors
- [ ] API requests successful
- [ ] No CORS errors in browser
- [ ] Database operations working
- [ ] WebSocket connections working (if applicable)

### Security Verification
- [ ] Containers running as non-root user
- [ ] No default passwords in use
- [ ] CORS properly restricting origins
- [ ] Health endpoints not exposing sensitive data
- [ ] Database not accessible from outside network

## Monitoring Setup

### Log Monitoring
- [ ] Backend logs accessible: `docker compose logs backend`
- [ ] Frontend logs accessible: `docker compose logs frontend`
- [ ] Database logs accessible: `docker compose logs db`
- [ ] No error messages in logs

### Health Monitoring
- [ ] Backend health check: `curl http://localhost:3001/health`
- [ ] Frontend health check: `curl http://localhost:5173/`
- [ ] Database health: `docker compose exec db pg_isready -U db_user`

### Resource Monitoring
- [ ] Container resource usage: `docker stats`
- [ ] Disk space sufficient
- [ ] Memory usage normal
- [ ] CPU usage normal

## Security Hardening

### Immediate Actions
- [ ] Change all default passwords
- [ ] Restrict database port access (if not needed externally)
- [ ] Enable firewall rules
- [ ] Set up SSL/TLS termination (nginx/traefik)

### Ongoing Maintenance
- [ ] Regular security updates for base images
- [ ] Scan images for vulnerabilities
- [ ] Rotate passwords periodically
- [ ] Monitor access logs
- [ ] Implement rate limiting

## Rollback Plan

### If Deployment Fails
```bash
# Stop all services
docker compose down

# Check logs for errors
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Fix issues in configuration

# Restart
docker compose up -d
```

### If Critical Issues Occur
```bash
# Immediate rollback
docker compose down

# Restore previous configuration
git checkout <previous-commit>

# Restart with previous config
docker compose up -d
```

## Documentation

### Available Documentation
- [ ] `DOCKER_DEPLOYMENT.md` - Comprehensive deployment guide
- [ ] `DOCKER_FIXES_SUMMARY.md` - Summary of all changes
- [ ] `QUICK_START.md` - Quick start guide
- [ ] `DEPLOYMENT_CHECKLIST.md` - This checklist
- [ ] `verify-docker-config.ps1` - Verification script (Windows)
- [ ] `verify-docker-config.sh` - Verification script (Linux/Mac)

### Team Handoff
- [ ] Team trained on new Docker setup
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide available
- [ ] On-call procedures defined

## Production Readiness Assessment

### Security
- [ ] No default passwords
- [ ] Non-root containers
- [ ] Network isolation
- [ ] CORS properly configured
- [ ] Health checks in place
- [ ] Secrets management ready

### Reliability
- [ ] Health checks configured
- [ ] Restart policies set
- [ ] Service dependencies correct
- [ ] Resource limits appropriate
- [ ] Backup strategy defined

### Maintainability
- [ ] Multi-stage builds
- [ ] Clear documentation
- [ ] Verification scripts
- [ ] Troubleshooting guides
- [ ] Update procedures

## Sign-off

**Deployment Engineer:** ______________________ Date: ________

**Security Review:** ______________________ Date: ________

**Operations Approval:** ______________________ Date: ________

---

## Notes

Additional notes or issues encountered during deployment:

```
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
```

## Issues Found and Resolved

Track any issues found during deployment and their resolution:

| Issue | Severity | Resolution | Verified By |
|-------|----------|------------|-------------|
|       |          |            |             |
|       |          |            |             |
|       |          |            |             |
