import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * 全局异常过滤器
 * 统一处理所有异常并返回标准化的错误响应
 * 开发模式下提供详细的错误信息和堆栈跟踪
 */
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 获取请求ID（如果有中间件生成）
    const requestId = (request as any).id || this.generateRequestId();

    // 判断异常类型
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 获取错误消息
    const errorMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // 提取错误详情
    const message =
      typeof errorMessage === 'string'
        ? errorMessage
        : (errorMessage as any).message || 'Internal server error';

    // 获取错误对象详情
    const errorDetails = this.getErrorDetails(exception);

    // 记录错误日志（开发模式下更详细）
    this.logError(request, exception, errorDetails, requestId);

    // 构建错误响应
    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId,
      message,
    };

    // 开发模式下返回详细错误信息
    if (this.isDevelopment) {
      errorResponse.debug = {
        type: errorDetails.name,
        stack: errorDetails.stack,
        // 代码位置信息
        codeLocation: this.getCodeLocation(errorDetails.stack),
        // 请求详情
        request: {
          headers: this.sanitizeHeaders(request.headers),
          query: this.sanitizeQuery(request.query),
          body: this.sanitizeBody(request.body),
          params: this.sanitizeParams(request.params),
        },
        // 系统信息
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          env: process.env.NODE_ENV,
        },
      };
    }

    // 生产环境下只返回必要信息
    if (!this.isDevelopment && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      errorResponse.message = '服务器内部错误，请稍后重试';
    }

    response.status(status).json(errorResponse);
  }

  /**
   * 获取详细的错误信息
   */
  private getErrorDetails(exception: unknown) {
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
        cause: exception.cause,
      };
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return {
        name: exception.name,
        message:
          typeof response === 'string' ? response : (response as any).message,
        stack: exception.stack,
      };
    }

    return {
      name: 'UnknownError',
      message: String(exception),
      stack: undefined,
    };
  }

  /**
   * 记录错误日志
   */
  private logError(
    request: Request,
    exception: unknown,
    errorDetails: any,
    requestId: string,
  ) {
    const logData: any = {
      requestId,
      message: 'Unhandled exception occurred',
      error: {
        name: errorDetails.name,
        message: errorDetails.message,
        stack: errorDetails.stack,
      },
      request: {
        method: request.method,
        url: request.url,
        ip: request.ip,
        headers: {
          'user-agent': request.headers['user-agent'],
          'content-type': request.headers['content-type'],
        },
        body: this.sanitizeBody(request.body),
      },
      timestamp: new Date().toISOString(),
    };

    // 开发模式下记录更详细的信息
    if (this.isDevelopment) {
      this.logger.error(JSON.stringify(logData, null, 2));
    } else {
      this.logger.error(logData);
    }
  }

  /**
   * 从堆栈中提取代码位置信息
   */
  private getCodeLocation(
    stack?: string,
  ): { file?: string; line?: string; column?: string } | undefined {
    if (!stack) return undefined;

    const lines = stack.split('\n');
    // 找到第一个非node_modules的堆栈行
    for (const line of lines) {
      if (line.includes('(') && !line.includes('node_modules')) {
        const match = line.match(/\((.*?):(\d+):(\d+)\)/);
        if (match) {
          return {
            file: match[1],
            line: match[2],
            column: match[3],
          };
        }
      }
    }
    return undefined;
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清理请求头中的敏感信息 - 增强版
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveFields = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'x-csrf-token',
      'set-cookie',
      'x-access-token',
      'authentication',
      'proxy-authorization',
      'sec-websocket-key',
    ];

    // 清理敏感字段
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    // 清理包含敏感词的自定义头
    Object.keys(sanitized).forEach((key) => {
      const lowerKey = key.toLowerCase();
      if (
        (lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('key') ||
          lowerKey.includes('auth') ||
          lowerKey.includes('password') ||
          lowerKey.includes('credential')) &&
        !sensitiveFields.includes(lowerKey)
      ) {
        sanitized[key] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  /**
   * 清理请求体中的敏感信息 - 增强版
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
      'accessToken',
      'refreshToken',
      'idToken',
      'privateKey',
      'apiKeySecret',
      'webhookSecret',
      'credentials',
      'authToken',
      'sessionToken',
      'csrfToken',
      'otp',
      'pin',
      'ssn',
      'creditCard',
    ];

    // 清理顶层敏感字段
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    // 递归清理嵌套对象
    const deepSanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        return obj.map(deepSanitize);
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some(
          (field) =>
            lowerKey === field.toLowerCase() ||
            lowerKey.includes('password') ||
            lowerKey.includes('token') ||
            lowerKey.includes('secret') ||
            lowerKey.includes('key') ||
            lowerKey.includes('auth'),
        );

        if (isSensitive && value) {
          sanitized[key] = '***REDACTED***';
        } else if (typeof value === 'object') {
          sanitized[key] = deepSanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    return deepSanitize(sanitized);
  }

  /**
   * 清理查询参数中的敏感信息
   */
  private sanitizeQuery(query: any): any {
    if (!query) return query;

    const sanitized = { ...query };
    const sensitiveFields = [
      'token',
      'apiKey',
      'secret',
      'password',
      'authorization',
      'accessToken',
      'key',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  /**
   * 清理路径参数中的敏感信息
   */
  private sanitizeParams(params: any): any {
    if (!params) return params;

    const sanitized = { ...params };
    // 路径参数通常不应该包含敏感信息，但为了安全起见，清理id字段
    if (
      sanitized.id &&
      typeof sanitized.id === 'string' &&
      sanitized.id.length > 50
    ) {
      // 如果id看起来像token或长字符串，截断它
      sanitized.id = sanitized.id.substring(0, 20) + '...';
    }

    return sanitized;
  }
}
