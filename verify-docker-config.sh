#!/bin/bash

# Docker Configuration Verification Script
# This script verifies all Docker-related configurations

set -e

echo "========================================"
echo "Docker Configuration Verification"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for issues
ISSUES=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ISSUES=$((ISSUES + 1))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

# 1. Check if Docker is installed
echo "1. Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    print_status 0 "Docker installed: $DOCKER_VERSION"
else
    print_status 1 "Docker not installed"
fi

# 2. Check if Docker Compose is installed
echo ""
echo "2. Checking Docker Compose installation..."
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short)
    print_status 0 "Docker Compose installed: $COMPOSE_VERSION"
else
    print_status 1 "Docker Compose not installed"
fi

# 3. Check docker-compose.yml syntax
echo ""
echo "3. Checking docker-compose.yml syntax..."
if docker compose config &> /dev/null; then
    print_status 0 "docker-compose.yml syntax is valid"
else
    print_status 1 "docker-compose.yml has syntax errors"
fi

# 4. Check Backend Dockerfile
echo ""
echo "4. Checking Backend Dockerfile..."
if [ -f "backend/Dockerfile" ]; then
    print_status 0 "Backend Dockerfile exists"

    # Check for multi-stage build
    if grep -q "FROM.*AS dependencies" backend/Dockerfile && \
       grep -q "FROM.*AS build" backend/Dockerfile && \
       grep -q "FROM.*AS production" backend/Dockerfile; then
        print_status 0 "Backend uses multi-stage build"
    else
        print_status 1 "Backend missing multi-stage build"
    fi

    # Check for non-root user
    if grep -q "adduser.*nodejs.*1001" backend/Dockerfile || \
       grep -q "USER.*nodejs" backend/Dockerfile; then
        print_status 0 "Backend uses non-root user"
    else
        print_status 1 "Backend missing non-root user"
    fi

    # Check for health check
    if grep -q "HEALTHCHECK" backend/Dockerfile; then
        print_status 0 "Backend has health check"
    else
        print_status 1 "Backend missing health check"
    fi
else
    print_status 1 "Backend Dockerfile not found"
fi

# 5. Check Frontend Dockerfile
echo ""
echo "5. Checking Frontend Dockerfile..."
if [ -f "frontend/Dockerfile" ]; then
    print_status 0 "Frontend Dockerfile exists"

    # Check for multi-stage build
    if grep -q "FROM.*AS dependencies" frontend/Dockerfile && \
       grep -q "FROM.*AS build" frontend/Dockerfile && \
       grep -q "FROM.*AS production" frontend/Dockerfile; then
        print_status 0 "Frontend uses multi-stage build"
    else
        print_status 1 "Frontend missing multi-stage build"
    fi

    # Check for non-root user
    if grep -q "adduser.*nodejs.*1001" frontend/Dockerfile || \
       grep -q "USER.*nodejs" frontend/Dockerfile; then
        print_status 0 "Frontend uses non-root user"
    else
        print_status 1 "Frontend missing non-root user"
    fi

    # Check for health check
    if grep -q "HEALTHCHECK" frontend/Dockerfile; then
        print_status 0 "Frontend has health check"
    else
        print_status 1 "Frontend missing health check"
    fi
else
    print_status 1 "Frontend Dockerfile not found"
fi

# 6. Check docker-compose.yml for security issues
echo ""
echo "6. Checking docker-compose.yml security..."

if [ -f "docker-compose.yml" ]; then
    # Check for default passwords
    if grep -q "POSTGRES_PASSWORD:.*password" docker-compose.yml; then
        print_status 1 "Found default password in docker-compose.yml"
    else
        print_status 0 "No default passwords found"
    fi

    # Check for health checks
    if grep -q "healthcheck:" docker-compose.yml; then
        print_status 0 "Health checks configured"
    else
        print_status 1 "Health checks not configured"
    fi

    # Check for custom network
    if grep -q "networks:" docker-compose.yml; then
        print_status 0 "Custom network configured"
    else
        print_status 1 "Custom network not configured"
    fi

    # Check for frontend startup command
    if grep -q "npm run dev.*--host" docker-compose.yml; then
        print_status 0 "Frontend startup command correct"
    else
        print_status 1 "Frontend startup command incorrect"
    fi
else
    print_status 1 "docker-compose.yml not found"
fi

# 7. Check .env file
echo ""
echo "7. Checking environment configuration..."
if [ -f ".env" ]; then
    print_status 0 ".env file exists"

    # Check for required variables
    if grep -q "^DB_USER=" .env && \
       grep -q "^DB_PASSWORD=" .env && \
       grep -q "^DB_NAME=" .env; then
        print_status 0 "Required database variables set"
    else
        print_warning "Some required database variables missing"
    fi

    # Check for default passwords
    if grep -q "DB_PASSWORD=.*password" .env; then
        print_warning "Using default password in .env (should be changed)"
    fi
else
    print_warning ".env file not found (copy from .env.example)"
fi

# 8. Check CORS configuration
echo ""
echo "8. Checking CORS configuration..."
if [ -f "backend/src/main.ts" ]; then
    if grep -q "ALLOWED_ORIGINS" backend/src/main.ts; then
        print_status 0 "CORS uses ALLOWED_ORIGINS environment variable"
    else
        print_status 1 "CORS not using ALLOWED_ORIGINS environment variable"
    fi

    # Check for credentials
    if grep -q "credentials: true" backend/src/main.ts; then
        print_status 0 "CORS credentials enabled"
    else
        print_status 1 "CORS credentials not enabled"
    fi
else
    print_status 1 "backend/src/main.ts not found"
fi

# 9. Check health check endpoint
echo ""
echo "9. Checking health check endpoint..."
if [ -f "backend/src/app.controller.ts" ]; then
    if grep -q "@Get('health')" backend/src/app.controller.ts; then
        print_status 0 "Health check endpoint exists"
    else
        print_status 1 "Health check endpoint missing"
    fi
else
    print_status 1 "backend/src/app.controller.ts not found"
fi

# 10. Check .dockerignore files
echo ""
echo "10. Checking .dockerignore files..."
if [ -f "backend/.dockerignore" ]; then
    print_status 0 "Backend .dockerignore exists"
else
    print_warning "Backend .dockerignore not found (optional)"
fi

if [ -f "frontend/.dockerignore" ]; then
    print_status 0 "Frontend .dockerignore exists"
else
    print_warning "Frontend .dockerignore not found (optional)"
fi

# Summary
echo ""
echo "========================================"
echo "Verification Summary"
echo "========================================"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Ensure .env file is configured with real credentials"
    echo "2. Run: docker compose up -d"
    echo "3. Check logs: docker compose logs -f"
    exit 0
else
    echo -e "${RED}Found $ISSUES issue(s) that need attention${NC}"
    echo ""
    echo "Please review and fix the issues above before deploying."
    exit 1
fi
