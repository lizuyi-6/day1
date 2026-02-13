import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      browserId?: string;
    }
  }
}

@Injectable()
export class BrowserIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BrowserIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    let browserId =
      (req.headers['x-browser-id'] as string) || req.cookies?.browser_id;

    if (!browserId) {
      browserId = uuidv4();
      this.logger.debug(`Generated new browserId: ${browserId}`);
    } else {
      this.logger.debug(`Received browserId: ${browserId}`);
    }

    req.browserId = browserId;

    if (!req.cookies?.browser_id) {
      // 开发环境强制使用 localhost，防止 Cookie 跨浏览器共享
      const isDev = process.env.NODE_ENV !== 'production';

      res.cookie('browser_id', browserId, {
        httpOnly: true,
        secure: !isDev, // 生产环境使用 HTTPS
        sameSite: isDev ? 'strict' : 'none', // 开发环境严格同站，生产环境允许跨站点
        maxAge: 365 * 24 * 60 * 60 * 1000,
        domain: isDev ? 'localhost' : (process.env.COOKIE_DOMAIN || undefined),
      });
      this.logger.debug(`Set browser_id cookie: ${browserId}`);
    }

    next();
  }
}
