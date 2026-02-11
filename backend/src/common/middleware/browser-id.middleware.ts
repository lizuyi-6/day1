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
      res.cookie('browser_id', browserId, {
        httpOnly: true,
        secure: false, // Allow HTTP for local dev
        sameSite: 'lax', // Relax for cross-port (3000 vs 5173)
        maxAge: 365 * 24 * 60 * 60 * 1000,
        domain: process.env.COOKIE_DOMAIN || undefined,
      });
      this.logger.debug(`Set browser_id cookie: ${browserId}`);
    }

    next();
  }
}
