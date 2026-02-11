#!/bin/bash

# Configuration Security Verification Script
# This script verifies that all security configurations are properly set up

echo "=========================================="
echo "Configuration Security Verification"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
PASS=0
FAIL=0
WARN=0

# Check function
check() {
    local description=$1
    local command=$2
    local expected=$3

    echo -n "Checking: $description ... "
    result=$(eval $command 2>/dev/null)

    if [ "$result" = "$expected" ]; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "  Expected: $expected"
        echo "  Got: $result"
        ((FAIL++))
    fi
}

# Warning check function
warn_check() {
    local description=$1
    local command=$2
    local should_exist=$3

    echo -n "Checking: $description ... "
    result=$(eval $command 2>/dev/null)

    if [ -n "$result" ]; then
        if [ "$should_exist" = "yes" ]; then
            echo -e "${GREEN}PASS${NC}"
            ((PASS++))
        else
            echo -e "${YELLOW}WARNING${NC}"
            echo "  Found: $result"
            ((WARN++))
        fi
    else
        if [ "$should_exist" = "yes" ]; then
            echo -e "${RED}FAIL${NC}"
            ((FAIL++))
        else
            echo -e "${GREEN}PASS${NC}"
            ((PASS++))
        fi
    fi
}

echo "=== Environment Template Files ==="
check "Backend .env.example exists" "test -f backend/.env.example && echo yes" "yes"
check "Frontend .env.example exists" "test -f frontend/.env.example && echo yes" "yes"
check "Root .env.example exists" "test -f .env.example && echo yes" "yes"

echo ""
echo "=== Configuration Files ==="
check "API config module exists" "test -f frontend/src/config/api.ts && echo yes" "yes"
check "API config exports API_BASE_URL" "grep -q 'export const API_BASE_URL' frontend/src/config/api.ts && echo yes" "yes"

echo ""
echo "=== Hardcoded Secrets Check ==="
warn_check "No hardcoded localhost:3001 in frontend services" "grep -r 'localhost:3001' frontend/src/services/ | grep -v 'node_modules'" "no"
warn_check "No hardcoded passwords in TypeScript files" "grep -r 'password.*=.*['\\\"']' frontend/src/ backend/src/ --include='*.ts' | grep -v 'node_modules' | grep -v '.env'" "no"
warn_check "No hardcoded API keys in TypeScript files" "grep -r 'api[_-]key.*=.*['\\\"']' frontend/src/ backend/src/ --include='*.ts' | grep -v 'node_modules' | grep -v '.env'" "no"

echo ""
echo "=== Git Ignore Configuration ==="
check ".gitignore ignores .env files" "grep -q '^\.env$' .gitignore && echo yes" "yes"
check ".gitignore ignores .env.local" "grep -q '\.env\.local' .gitignore && echo yes" "yes"
check ".gitignore ignores log files" "grep -q '\*\.log' .gitignore && echo yes" "yes"

echo ""
echo "=== Docker Configuration ==="
check "docker-compose.yml has no default DB password" "! grep -q 'POSTGRES_PASSWORD:.*password' docker-compose.yml && echo yes" "yes"
check "docker-compose.yml uses env variables for DB" "grep -q 'POSTGRES_PASSWORD: \${DB_PASSWORD}' docker-compose.yml && echo yes" "yes"

echo ""
echo "=== API Configuration Usage ==="
check "workflowService imports API_BASE_URL" "grep -q 'import.*API_BASE_URL.*from.*config/api' frontend/src/services/workflowService.ts && echo yes" "yes"
check "workflowService uses API_BASE_URL" "grep -q '\${API_BASE_URL}' frontend/src/services/workflowService.ts && echo yes" "yes"

echo ""
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC}  $PASS"
echo -e "${YELLOW}Warnings:${NC} $WARN"
echo -e "${RED}Failed:${NC}   $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All security configurations are properly set up!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some security checks failed. Please review the output above.${NC}"
    exit 1
fi
