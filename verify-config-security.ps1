# Configuration Security Verification Script (PowerShell)
# This script verifies that all security configurations are properly set up

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Configuration Security Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Track results
$Pass = 0
$Fail = 0
$Warn = 0

function Test-Check {
    param(
        [string]$Description,
        [scriptblock]$Test,
        [bool]$Expected
    )

    Write-Host -NoNewline "Checking: $Description ... "
    $result = & $Test

    if ($result -eq $Expected) {
        Write-Host "PASS" -ForegroundColor Green
        $script:Pass++
    } else {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "  Expected: $Expected" -ForegroundColor Gray
        Write-Host "  Got: $result" -ForegroundColor Gray
        $script:Fail++
    }
}

function Test-WarnCheck {
    param(
        [string]$Description,
        [scriptblock]$Test,
        [bool]$ShouldExist
    )

    Write-Host -NoNewline "Checking: $Description ... "
    $result = & $Test

    if ($result) {
        if ($ShouldExist) {
            Write-Host "PASS" -ForegroundColor Green
            $script:Pass++
        } else {
            Write-Host "WARNING" -ForegroundColor Yellow
            Write-Host "  Found: $result" -ForegroundColor Gray
            $script:Warn++
        }
    } else {
        if ($ShouldExist) {
            Write-Host "FAIL" -ForegroundColor Red
            $script:Fail++
        } else {
            Write-Host "PASS" -ForegroundColor Green
            $script:Pass++
        }
    }
}

Write-Host "=== Environment Template Files ===" -ForegroundColor Cyan
Test-Check "Backend .env.example exists" { Test-Path "backend\.env.example" } $true
Test-Check "Frontend .env.example exists" { Test-Path "frontend\.env.example" } $true
Test-Check "Root .env.example exists" { Test-Path ".env.example" } $true

Write-Host ""
Write-Host "=== Configuration Files ===" -ForegroundColor Cyan
Test-Check "API config module exists" { Test-Path "frontend\src\config\api.ts" } $true
Test-Check "API config exports API_BASE_URL" {
    $content = Get-Content "frontend\src\config\api.ts" -Raw
    $content -match 'export const API_BASE_URL'
} $true

Write-Host ""
Write-Host "=== Hardcoded Secrets Check ===" -ForegroundColor Cyan
Test-WarnCheck "No hardcoded localhost:3001 in frontend services" {
    $matches = Select-String -Path "frontend\src\services\*" -Pattern "localhost:3001" -Exclude "node_modules"
    $matches -ne $null
} $false

Test-WarnCheck "No hardcoded passwords in TypeScript files" {
    $matches = Select-String -Path "frontend\src\*", "backend\src\*" -Pattern 'password.*=.*["\'].*["\']' -Exclude "node_modules", ".env" -Filter "*.ts"
    $matches -ne $null
} $false

Test-WarnCheck "No hardcoded API keys in TypeScript files" {
    $matches = Select-String -Path "frontend\src\*", "backend\src\*" -Pattern 'api[_-]key.*=.*["\'].*["\']' -Exclude "node_modules", ".env" -Filter "*.ts"
    $matches -ne $null
} $false

Write-Host ""
Write-Host "=== Git Ignore Configuration ===" -ForegroundColor Cyan
Test-Check ".gitignore ignores .env files" {
    $content = Get-Content ".gitignore" -Raw
    $content -match '^\.env$'
} $true

Test-Check ".gitignore ignores .env.local" {
    $content = Get-Content ".gitignore" -Raw
    $content -match '\.env\.local'
} $true

Test-Check ".gitignore ignores log files" {
    $content = Get-Content ".gitignore" -Raw
    $content -match '\*\.log'
} $true

Write-Host ""
Write-Host "=== Docker Configuration ===" -ForegroundColor Cyan
Test-Check "docker-compose.yml has no default DB password" {
    $content = Get-Content "docker-compose.yml" -Raw
    -not ($content -match 'POSTGRES_PASSWORD:.*password')
} $true

Test-Check "docker-compose.yml uses env variables for DB" {
    $content = Get-Content "docker-compose.yml" -Raw
    $content -match 'POSTGRES_PASSWORD: \$\{DB_PASSWORD\}'
} $true

Write-Host ""
Write-Host "=== API Configuration Usage ===" -ForegroundColor Cyan
Test-Check "workflowService imports API_BASE_URL" {
    $content = Get-Content "frontend\src\services\workflowService.ts" -Raw
    $content -match 'import.*API_BASE_URL.*from.*config/api'
} $true

Test-Check "workflowService uses API_BASE_URL" {
    $content = Get-Content "frontend\src\services\workflowService.ts" -Raw
    $content -match '\$\{API_BASE_URL\}'
} $true

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Passed:  $Pass" -ForegroundColor Green
Write-Host "Warnings: $Warn" -ForegroundColor Yellow
Write-Host "Failed:   $Fail" -ForegroundColor Red
Write-Host ""

if ($Fail -eq 0) {
    Write-Host "✓ All security configurations are properly set up!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some security checks failed. Please review the output above." -ForegroundColor Red
    exit 1
}
