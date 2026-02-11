# Docker Configuration Verification Script for Windows
# This script verifies all Docker-related configurations

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Configuration Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Counter for issues
$issues = 0

# Function to print status
function Print-Status {
    param([bool]$Success, [string]$Message)
    if ($Success) {
        Write-Host "✓ $Message" -ForegroundColor Green
    } else {
        Write-Host "✗ $Message" -ForegroundColor Red
        $script:issues++
    }
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Green
}

# 1. Check if Docker is installed
Write-Host "1. Checking Docker installation..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Print-Status -Success $true -Message "Docker installed: $dockerVersion"
    } else {
        Print-Status -Success $false -Message "Docker not installed or not running"
    }
} catch {
    Print-Status -Success $false -Message "Docker not installed or not running"
}

# 2. Check if Docker Compose is installed
Write-Host ""
Write-Host "2. Checking Docker Compose installation..." -ForegroundColor Cyan
try {
    $composeVersion = docker compose version --short 2>$null
    if ($LASTEXITCODE -eq 0) {
        Print-Status -Success $true -Message "Docker Compose installed: $composeVersion"
    } else {
        Print-Status -Success $false -Message "Docker Compose not installed"
    }
} catch {
    Print-Status -Success $false -Message "Docker Compose not installed"
}

# 3. Check docker-compose.yml syntax
Write-Host ""
Write-Host "3. Checking docker-compose.yml syntax..." -ForegroundColor Cyan
try {
    $null = docker compose config 2>$null
    if ($LASTEXITCODE -eq 0) {
        Print-Status -Success $true -Message "docker-compose.yml syntax is valid"
    } else {
        Print-Status -Success $false -Message "docker-compose.yml has syntax errors"
    }
} catch {
    Print-Status -Success $false -Message "docker-compose.yml has syntax errors"
}

# 4. Check Backend Dockerfile
Write-Host ""
Write-Host "4. Checking Backend Dockerfile..." -ForegroundColor Cyan
if (Test-Path "backend\Dockerfile") {
    Print-Status -Success $true -Message "Backend Dockerfile exists"

    $dockerfileContent = Get-Content "backend\Dockerfile" -Raw

    # Check for multi-stage build
    if ($dockerfileContent -match "FROM.*AS dependencies" -and
        $dockerfileContent -match "FROM.*AS build" -and
        $dockerfileContent -match "FROM.*AS production") {
        Print-Status -Success $true -Message "Backend uses multi-stage build"
    } else {
        Print-Status -Success $false -Message "Backend missing multi-stage build"
    }

    # Check for non-root user
    if ($dockerfileContent -match "adduser.*nodejs.*1001" -or
        $dockerfileContent -match "USER.*nodejs") {
        Print-Status -Success $true -Message "Backend uses non-root user"
    } else {
        Print-Status -Success $false -Message "Backend missing non-root user"
    }

    # Check for health check
    if ($dockerfileContent -match "HEALTHCHECK") {
        Print-Status -Success $true -Message "Backend has health check"
    } else {
        Print-Status -Success $false -Message "Backend missing health check"
    }
} else {
    Print-Status -Success $false -Message "Backend Dockerfile not found"
}

# 5. Check Frontend Dockerfile
Write-Host ""
Write-Host "5. Checking Frontend Dockerfile..." -ForegroundColor Cyan
if (Test-Path "frontend\Dockerfile") {
    Print-Status -Success $true -Message "Frontend Dockerfile exists"

    $dockerfileContent = Get-Content "frontend\Dockerfile" -Raw

    # Check for multi-stage build
    if ($dockerfileContent -match "FROM.*AS dependencies" -and
        $dockerfileContent -match "FROM.*AS build" -and
        $dockerfileContent -match "FROM.*AS production") {
        Print-Status -Success $true -Message "Frontend uses multi-stage build"
    } else {
        Print-Status -Success $false -Message "Frontend missing multi-stage build"
    }

    # Check for non-root user
    if ($dockerfileContent -match "adduser.*nodejs.*1001" -or
        $dockerfileContent -match "USER.*nodejs") {
        Print-Status -Success $true -Message "Frontend uses non-root user"
    } else {
        Print-Status -Success $false -Message "Frontend missing non-root user"
    }

    # Check for health check
    if ($dockerfileContent -match "HEALTHCHECK") {
        Print-Status -Success $true -Message "Frontend has health check"
    } else {
        Print-Status -Success $false -Message "Frontend missing health check"
    }
} else {
    Print-Status -Success $false -Message "Frontend Dockerfile not found"
}

# 6. Check docker-compose.yml for security issues
Write-Host ""
Write-Host "6. Checking docker-compose.yml security..." -ForegroundColor Cyan
if (Test-Path "docker-compose.yml") {
    $composeContent = Get-Content "docker-compose.yml" -Raw

    # Check for default passwords
    if ($composeContent -match "POSTGRES_PASSWORD:.*password") {
        Print-Status -Success $false -Message "Found default password in docker-compose.yml"
    } else {
        Print-Status -Success $true -Message "No default passwords found"
    }

    # Check for health checks
    if ($composeContent -match "healthcheck:") {
        Print-Status -Success $true -Message "Health checks configured"
    } else {
        Print-Status -Success $false -Message "Health checks not configured"
    }

    # Check for custom network
    if ($composeContent -match "networks:") {
        Print-Status -Success $true -Message "Custom network configured"
    } else {
        Print-Status -Success $false -Message "Custom network not configured"
    }

    # Check for frontend startup command
    if ($composeContent -match "npm run dev.*--host") {
        Print-Status -Success $true -Message "Frontend startup command correct"
    } else {
        Print-Status -Success $false -Message "Frontend startup command incorrect"
    }
} else {
    Print-Status -Success $false -Message "docker-compose.yml not found"
}

# 7. Check .env file
Write-Host ""
Write-Host "7. Checking environment configuration..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Print-Status -Success $true -Message ".env file exists"

    $envContent = Get-Content ".env" -Raw

    # Check for required variables
    if ($envContent -match "^DB_USER=" -and
        $envContent -match "^DB_PASSWORD=" -and
        $envContent -match "^DB_NAME=") {
        Print-Status -Success $true -Message "Required database variables set"
    } else {
        Print-Warning -Message "Some required database variables missing"
    }

    # Check for default passwords
    if ($envContent -match "DB_PASSWORD=.*password") {
        Print-Warning -Message "Using default password in .env (should be changed)"
    }
} else {
    Print-Warning -Message ".env file not found (copy from .env.example)"
}

# 8. Check CORS configuration
Write-Host ""
Write-Host "8. Checking CORS configuration..." -ForegroundColor Cyan
if (Test-Path "backend\src\main.ts") {
    $mainTsContent = Get-Content "backend\src\main.ts" -Raw

    if ($mainTsContent -match "ALLOWED_ORIGINS") {
        Print-Status -Success $true -Message "CORS uses ALLOWED_ORIGINS environment variable"
    } else {
        Print-Status -Success $false -Message "CORS not using ALLOWED_ORIGINS environment variable"
    }

    # Check for credentials
    if ($mainTsContent -match "credentials:\s*true") {
        Print-Status -Success $true -Message "CORS credentials enabled"
    } else {
        Print-Status -Success $false -Message "CORS credentials not enabled"
    }
} else {
    Print-Status -Success $false -Message "backend\src\main.ts not found"
}

# 9. Check health check endpoint
Write-Host ""
Write-Host "9. Checking health check endpoint..." -ForegroundColor Cyan
if (Test-Path "backend\src\app.controller.ts") {
    $controllerContent = Get-Content "backend\src\app.controller.ts" -Raw

    if ($controllerContent -match "@Get\('health'\)") {
        Print-Status -Success $true -Message "Health check endpoint exists"
    } else {
        Print-Status -Success $false -Message "Health check endpoint missing"
    }
} else {
    Print-Status -Success $false -Message "backend\src\app.controller.ts not found"
}

# 10. Check .dockerignore files
Write-Host ""
Write-Host "10. Checking .dockerignore files..." -ForegroundColor Cyan
if (Test-Path "backend\.dockerignore") {
    Print-Status -Success $true -Message "Backend .dockerignore exists"
} else {
    Print-Warning -Message "Backend .dockerignore not found (optional)"
}

if (Test-Path "frontend\.dockerignore") {
    Print-Status -Success $true -Message "Frontend .dockerignore exists"
} else {
    Print-Warning -Message "Frontend .dockerignore not found (optional)"
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($issues -eq 0) {
    Write-Host "All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Ensure .env file is configured with real credentials"
    Write-Host "2. Run: docker compose up -d"
    Write-Host "3. Check logs: docker compose logs -f"
    exit 0
} else {
    Write-Host "Found $issues issue(s) that need attention" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review and fix the issues above before deploying." -ForegroundColor Red
    exit 1
}
