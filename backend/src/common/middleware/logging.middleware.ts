import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * 开发模式日志中间件
 * 在开发模式下记录详细的请求和响应信息
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // 生成请求ID
    const requestId = this.generateRequestId();
    (req as any).id = requestId;

    // 记录请求开始时间
    const startTime = Date.now();

    // 在开发模式下记录请求详情
    if (this.isDevelopment) {
      this.logRequest(req, requestId);
    }

    // 监听响应完成事件
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      if (this.isDevelopment) {
        this.logResponse(req, res, requestId, duration);
      } else {
        // 生产环境下只记录基本信息
        this.logger.log(
          `${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
        );
      }
    });

    next();
  }

  /**
   * 记录请求详情（开发模式）- 使用异步日志优化性能
   */
  private logRequest(req: Request, requestId: string): void {
    setImmediate(() => {
      this.logger.log(`→ [${requestId}] ${req.method} ${req.url}`);

      // 记录查询参数
      if (Object.keys(req.query).length > 0) {
        this.logger.debug(`  Query: ${JSON.stringify(req.query)}`);
      }

      // 记录请求体（对于POST/PUT/PATCH请求）
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        const sanitizedBody = this.sanitizeBody(req.body);
        this.logger.debug(`  Body: ${JSON.stringify(sanitizedBody, null, 2)}`);
      }

      // 记录请求头（关键信息）
      this.logger.debug(`  Headers: {
        "content-type": "${req.headers['content-type']}",
        "user-agent": "${req.headers['user-agent']}",
        "authorization": "${req.headers['authorization'] ? '***' : 'none'}"
      }`);
    });
  }

  /**
   * 记录响应详情（开发模式）
   */
  private logResponse(
    req: Request,
    res: Response,
    requestId: string,
    duration: number,
  ): void {
    const statusColor = this.getStatusColor(res.statusCode);
    const statusIcon = this.getStatusIcon(res.statusCode);

    this.logger.log(
      `← [${requestId}] ${req.method} ${req.url} ${statusColor}${res.statusCode}\x1b[0m ${duration}ms ${statusIcon}`,
    );

    // 如果是错误响应，记录更多详情
    if (res.statusCode >= 400) {
      this.logger.warn(
        `  Error Response: ${res.statusCode} for ${req.method} ${req.url}`,
      );
    }
  }

  /**
   * 获取状态码颜色（开发模式）
   */
  private getStatusColor(statusCode: number): string {
    if (statusCode >= 500) return '\x1b[31m'; // 红色
    if (statusCode >= 400) return '\x1b[33m'; // 黄色
    if (statusCode >= 300) return '\x1b[36m'; // 青色
    if (statusCode >= 200) return '\x1b[32m'; // 绿色
    return '\x1b[0m';
  }

  /**
   * 获取状态图标
   */
  private getStatusIcon(statusCode: number): string {
    if (statusCode >= 500) return '❌';
    if (statusCode >= 400) return '⚠️';
    if (statusCode >= 300) return '↪️';
    if (statusCode >= 200) return '✅';
    return '❓';
  }

  /**
   * 清理请求体中的敏感信息
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'oldPassword',
      'newPassword',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
