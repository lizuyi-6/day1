import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class HybridAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const hasJwtToken = request.headers.authorization?.startsWith('Bearer ');
    
    // Check cookies (requires cookie-parser) and headers
    const browserId = request.cookies?.browser_id 
      || request.headers['x-browser-id']
      || request.headers['X-Browser-Id']; // Fallback for case sensitivity if not normalized

    if (!hasJwtToken && !browserId) {
      console.log('🔒 Auth Guard Failed');
      console.log('- Headers:', JSON.stringify(request.headers));
      console.log('- Cookies:', JSON.stringify(request.cookies || {}));
      console.log('- BrowserId found:', browserId);
    } else if (browserId) {
      // console.log('🔓 Auth Guard Success (BrowserID):', browserId);
    }

    if (browserId) {
      request.user = {
        id: browserId,
        isBrowserIdAuth: true,
      };
      return true;
    }

    if (hasJwtToken) {
      return super.canActivate(context);
    }

    throw new UnauthorizedException('Authentication required');
  }
}
