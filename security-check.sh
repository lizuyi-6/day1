#!/bin/bash

echo "=================================================="
echo "   安全漏洞修复验证脚本"
echo "=================================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_passed=0
check_failed=0

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((check_passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 (文件不存在)"
        ((check_failed++))
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 包含 '$2'"
        ((check_passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 缺少 '$2'"
        ((check_failed++))
        return 1
    fi
}

echo "1. 检查后端文件"
echo "-------------------------------------------"
check_file "backend/src/knowledge/knowledge.service.ts"
check_content "backend/src/knowledge/knowledge.service.ts" "sanitizeQuery"
check_content "backend/src/knowledge/knowledge.service.ts" "ESCAPE"

check_file "backend/src/common/filters/all-exceptions.filter.ts"
check_content "backend/src/common/filters/all-exceptions.filter.ts" "sanitizeHeaders"
check_content "backend/src/common/filters/all-exceptions.filter.ts" "sanitizeQuery"
check_content "backend/src/common/filters/all-exceptions.filter.ts" "sanitizeParams"

check_file "backend/src/app.module.ts"
check_content "backend/src/app.module.ts" "ThrottlerModule"
check_content "backend/src/app.module.ts" "ThrottlerGuard"

check_file "backend/src/main.ts"
check_content "backend/src/main.ts" "helmet"
check_content "backend/src/main.ts" "contentSecurityPolicy"

echo ""
echo "2. 检查前端文件"
echo "-------------------------------------------"
check_file "frontend/src/composables/useAuth.ts"
check_content "frontend/src/composables/useAuth.ts" "setToken"
check_content "frontend/src/composables/useAuth.ts" "getAuthHeaders"

check_file "frontend/src/utils/api.ts"
check_content "frontend/src/utils/api.ts" "fetchWithTimeout"
check_content "frontend/src/utils/api.ts" "apiRequest"

check_file "frontend/src/services/workflowService.ts"
check_content "frontend/src/services/workflowService.ts" "from '../utils/api'"

echo ""
echo "3. 检查依赖"
echo "-------------------------------------------"
if [ -f "backend/package.json" ]; then
    if grep -q "@nestjs/throttler" "backend/package.json"; then
        echo -e "${GREEN}✓${NC} backend/package.json 包含 @nestjs/throttler"
        ((check_passed++))
    else
        echo -e "${RED}✗${NC} backend/package.json 缺少 @nestjs/throttler"
        ((check_failed++))
    fi

    if grep -q "helmet" "backend/package.json"; then
        echo -e "${GREEN}✓${NC} backend/package.json 包含 helmet"
        ((check_passed++))
    else
        echo -e "${RED}✗${NC} backend/package.json 缺少 helmet"
        ((check_failed++))
    fi
else
    echo -e "${RED}✗${NC} backend/package.json 不存在"
    ((check_failed++))
fi

echo ""
echo "=================================================="
echo "   检查结果"
echo "=================================================="
echo -e "通过: ${GREEN}$check_passed${NC}"
echo -e "失败: ${RED}$check_failed${NC}"
echo ""

if [ $check_failed -eq 0 ]; then
    echo -e "${GREEN}所有安全检查通过！${NC}"
    exit 0
else
    echo -e "${RED}有 $check_failed 项检查失败，请检查上述错误。${NC}"
    exit 1
fi
