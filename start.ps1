# Aether Flow - 项目启动脚本 (改进版)

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Aether Flow - 启动脚本" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否运行
Write-Host "检查 Docker..." -ForegroundColor Yellow
try {
    $null = docker info 2>&1
    Write-Host "✓ Docker 运行正常" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker 未运行，请先启动 Docker Desktop" -ForegroundColor Red
    exit 1
}

# 清理旧容器（如果存在）
Write-Host ""
Write-Host "清理旧容器..." -ForegroundColor Yellow
docker-compose down 2>$null

# 启动所有服务
Write-Host ""
Write-Host "启动所有服务..." -ForegroundColor Yellow
docker-compose up -d

# 等待数据库健康检查通过
Write-Host ""
Write-Host "等待数据库启动..." -ForegroundColor Yellow
$dbAttempts = 0
$dbMaxAttempts = 30
while ($dbAttempts -lt $dbMaxAttempts) {
    $dbHealth = docker inspect aether_db --format='{{.State.Health.Status}}' 2>$null
    if ($dbHealth -eq "healthy") {
        Write-Host "✓ 数据库已就绪" -ForegroundColor Green
        break
    }
    $dbAttempts++
    Write-Host "  等待中... ($dbAttempts/$dbMaxAttempts)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if ($dbAttempts -ge $dbMaxAttempts) {
    Write-Host "✗ 数据库启动超时" -ForegroundColor Red
    Write-Host ""
    Write-Host "查看数据库日志:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs db" -ForegroundColor Gray
    exit 1
}

# 等待后端健康检查通过
Write-Host ""
Write-Host "等待后端启动..." -ForegroundColor Yellow
$backendAttempts = 0
$backendMaxAttempts = 60
while ($backendAttempts -lt $backendMaxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ 后端已就绪" -ForegroundColor Green
            break
        }
    } catch {
        # Ignore errors during startup
    }
    $backendAttempts++
    Write-Host "  等待中... ($backendAttempts/$backendMaxAttempts)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if ($backendAttempts -ge $backendMaxAttempts) {
    Write-Host "✗ 后端启动超时" -ForegroundColor Red
    Write-Host ""
    Write-Host "查看后端日志:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs backend" -ForegroundColor Gray
    exit 1
}

# 等待前端健康检查通过
Write-Host ""
Write-Host "等待前端启动..." -ForegroundColor Yellow
$frontendAttempts = 0
$frontendMaxAttempts = 60
while ($frontendAttempts -lt $frontendMaxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5174/" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ 前端已就绪" -ForegroundColor Green
            break
        }
    } catch {
        # Ignore errors during startup
    }
    $frontendAttempts++
    Write-Host "  等待中... ($frontendAttempts/$frontendMaxAttempts)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if ($frontendAttempts -ge $frontendMaxAttempts) {
    Write-Host "⚠ 前端启动超时，但其他服务已就绪" -ForegroundColor Yellow
}

# 最终状态检查
Write-Host ""
Write-Host "服务状态:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  项目已启动！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址:" -ForegroundColor White
Write-Host "  前端: http://localhost:5174" -ForegroundColor Cyan
Write-Host "  后端: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "查看日志:" -ForegroundColor White
Write-Host "  docker-compose logs -f              # 所有服务" -ForegroundColor Gray
Write-Host "  docker-compose logs -f backend     # 仅后端" -ForegroundColor Gray
Write-Host "  docker-compose logs -f frontend    # 仅前端" -ForegroundColor Gray
Write-Host ""
Write-Host "停止服务:" -ForegroundColor White
Write-Host "  docker-compose down" -ForegroundColor Gray
Write-Host ""
