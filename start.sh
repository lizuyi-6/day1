#!/bin/bash

# Aether Flow - 项目启动脚本 (改进版)

set -e

echo "================================"
echo "  Aether Flow - 启动脚本"
echo "================================"
echo ""

# 检查 Docker 是否运行
echo "检查 Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "✗ Docker 未运行，请先启动 Docker"
    exit 1
fi
echo "✓ Docker 运行正常"

# 清理旧容器（如果存在）
echo ""
echo "清理旧容器..."
docker-compose down 2>/dev/null || true

# 启动所有服务
echo ""
echo "启动所有服务..."
docker-compose up -d

# 等待数据库健康检查通过
echo ""
echo "等待数据库启动..."
DB_ATTEMPTS=0
DB_MAX_ATTEMPTS=30
while [ $DB_ATTEMPTS -lt $DB_MAX_ATTEMPTS ]; do
    DB_HEALTH=$(docker inspect aether_db --format='{{.State.Health.Status}}' 2>/dev/null || echo "starting")
    if [ "$DB_HEALTH" = "healthy" ]; then
        echo "✓ 数据库已就绪"
        break
    fi
    DB_ATTEMPTS=$((DB_ATTEMPTS + 1))
    echo "  等待中... ($DB_ATTEMPTS/$DB_MAX_ATTEMPTS)"
    sleep 2
done

if [ $DB_ATTEMPTS -ge $DB_MAX_ATTEMPTS ]; then
    echo "✗ 数据库启动超时"
    echo ""
    echo "查看数据库日志:"
    echo "  docker-compose logs db"
    exit 1
fi

# 等待后端健康检查通过
echo ""
echo "等待后端启动..."
BACKEND_ATTEMPTS=0
BACKEND_MAX_ATTEMPTS=60
while [ $BACKEND_ATTEMPTS -lt $BACKEND_MAX_ATTEMPTS ]; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "✓ 后端已就绪"
        break
    fi
    BACKEND_ATTEMPTS=$((BACKEND_ATTEMPTS + 1))
    echo "  等待中... ($BACKEND_ATTEMPTS/$BACKEND_MAX_ATTEMPTS)"
    sleep 2
done

if [ $BACKEND_ATTEMPTS -ge $BACKEND_MAX_ATTEMPTS ]; then
    echo "✗ 后端启动超时"
    echo ""
    echo "查看后端日志:"
    echo "  docker-compose logs backend"
    exit 1
fi

# 等待前端健康检查通过
echo ""
echo "等待前端启动..."
FRONTEND_ATTEMPTS=0
FRONTEND_MAX_ATTEMPTS=60
while [ $FRONTEND_ATTEMPTS -lt $FRONTEND_MAX_ATTEMPTS ]; do
    if curl -s http://localhost:5174/ > /dev/null 2>&1; then
        echo "✓ 前端已就绪"
        break
    fi
    FRONTEND_ATTEMPTS=$((FRONTEND_ATTEMPTS + 1))
    echo "  等待中... ($FRONTEND_ATTEMPTS/$FRONTEND_MAX_ATTEMPTS)"
    sleep 2
done

if [ $FRONTEND_ATTEMPTS -ge $FRONTEND_MAX_ATTEMPTS ]; then
    echo "⚠ 前端启动超时，但其他服务已就绪"
fi

# 最终状态检查
echo ""
echo "服务状态:"
docker-compose ps

echo ""
echo "================================"
echo "  项目已启动！"
echo "================================"
echo ""
echo "访问地址:"
echo "  前端: http://localhost:5174"
echo "  后端: http://localhost:3001"
echo ""
echo "查看日志:"
echo "  docker-compose logs -f              # 所有服务"
echo "  docker-compose logs -f backend     # 仅后端"
echo "  docker-compose logs -f frontend    # 仅前端"
echo ""
echo "停止服务:"
echo "  docker-compose down"
echo ""
