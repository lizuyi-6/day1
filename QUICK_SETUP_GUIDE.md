# Quick Setup Guide - Secure Configuration

## Overview
This guide helps you quickly set up secure environment configurations for the Aether Flow project.

## Step 1: Create Environment Files

```bash
# From project root directory
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Step 2: Configure Required Variables

### Root `.env` File (Minimal Required)
```bash
# Database Credentials (CHANGE THESE!)
DB_USER=aether_admin
DB_PASSWORD=your_secure_password_here_min_16_chars
DB_NAME=aether_flow

# LLM API Key (Required)
OPENAI_API_KEY=your_actual_api_key_here
```

### Backend `backend/.env` File
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=aether_admin
DB_PASSWORD=your_secure_password_here_min_16_chars
DB_NAME=aether_flow

# JWT (Generate a secure secret)
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRATION=7d

# API
PORT=3000
NODE_ENV=development

# LLM
OPENAI_API_KEY=your_actual_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
```

### Frontend `frontend/.env` File
```bash
# API URL (adjust if backend runs on different port)
VITE_API_URL=http://localhost:3001
```

## Step 3: Generate Secure Secrets

### JWT Secret
```bash
# Generate secure JWT secret (Linux/Mac)
openssl rand -base64 32

# Or use Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Database Password
```bash
# Generate strong password (16+ characters)
# Use combination of: uppercase, lowercase, numbers, symbols
# Example: Xk9#mP2$vL5@nQ8&wR4
```

## Step 4: Start Services

### Using Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Local Development
```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Step 5: Verify Configuration

### Check Backend Health
```bash
curl http://localhost:3001/health
```

### Check Frontend
```bash
# Open browser
http://localhost:5173
```

### Run Security Verification
```bash
# On Linux/Mac
bash verify-config-security.sh

# On Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File verify-config-security.ps1
```

## Common Configuration Scenarios

### Scenario 1: Local Development
```bash
# .env
DB_HOST=localhost
DB_PORT=5432
VITE_API_URL=http://localhost:3001
NODE_ENV=development
```

### Scenario 2: Docker Development
```bash
# .env
DB_HOST=db  # Docker service name
DB_PORT=5432
VITE_API_URL=http://localhost:3001
NODE_ENV=development
```

### Scenario 3: Production
```bash
# .env
DB_HOST=your-production-db-host
DB_PORT=5432
VITE_API_URL=https://api.yourdomain.com
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

## Environment Variable Reference

### Critical (Must Set)
| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_PASSWORD` | Database password | `Xk9#mP2$vL5@nQ8` |
| `JWT_SECRET` | JWT signing secret | `abc123...xyz789` |
| `OPENAI_API_KEY` | LLM API key | `sk-...` |

### Important (Should Set)
| Variable | Purpose | Default |
|----------|---------|---------|
| `DB_USER` | Database username | `admin` |
| `DB_NAME` | Database name | `aether_flow` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:3001` |

### Optional (Has Defaults)
| Variable | Purpose | Default |
|----------|---------|---------|
| `BACKEND_PORT` | Backend port | `3001` |
| `FRONTEND_PORT` | Frontend port | `5173` |
| `LLM_MODEL` | LLM model | `gpt-4` |

## Troubleshooting

### Issue: "Variable not set" Error
**Solution:**
1. Check `.env` file exists in correct location
2. Verify variable names match exactly (case-sensitive)
3. Ensure no trailing spaces in `.env` file
4. Restart services after changing `.env`

### Issue: CORS Errors
**Solution:**
1. Check `ALLOWED_ORIGINS` includes your frontend URL
2. Ensure protocol matches (http vs https)
3. Include port number if not using default ports
4. Restart backend after changing CORS settings

### Issue: Database Connection Failed
**Solution:**
1. Verify database is running: `docker-compose ps db`
2. Check `DB_HOST` (use `db` for Docker, `localhost` for local)
3. Review database logs: `docker-compose logs db`
4. Ensure password matches in all `.env` files

### Issue: API Returns 401 Unauthorized
**Solution:**
1. Check `JWT_SECRET` is set and matches
2. Verify JWT token is being sent in headers
3. Check token expiration: `JWT_EXPIRATION`
4. Clear browser cache and localStorage

## Security Best Practices

### DO:
- ✓ Use strong passwords (16+ characters)
- ✓ Use different credentials for each environment
- ✓ Rotate secrets regularly (every 90 days)
- ✓ Limit CORS origins to specific domains
- ✓ Use environment variables for all secrets
- ✓ Keep `.env.example` updated

### DON'T:
- ✗ Commit `.env` files to version control
- ✗ Use default passwords in production
- ✗ Share secrets via email/chat
- ✗ Use the same credentials everywhere
- ✗ Ignore security warnings
- ✗ Expose `.env` files in logs

## Production Deployment Checklist

- [ ] Generate new strong passwords
- [ ] Set secure JWT_SECRET (32+ characters)
- [ ] Configure production database
- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS
- [ ] Enable HTTPS/TLS
- [ ] Set up backup strategy
- [ ] Configure monitoring and alerts
- [ ] Review and update CORS settings
- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Document deployment process

## Additional Resources

- **Full Documentation**: See `CONFIGURATION_FIX_SUMMARY.md`
- **Docker Deployment**: See `DOCKER_DEPLOYMENT.md`
- **Development Guide**: See `DEV_MODE_GUIDE.md`
- **Troubleshooting**: Check project README

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Run verification script
3. Review environment variables
4. Check documentation
5. Contact support team

---

**Last Updated**: 2026-02-08
**Version**: 1.0.0
