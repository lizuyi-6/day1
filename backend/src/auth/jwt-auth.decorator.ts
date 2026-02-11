import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserType } from './types/user.types';

export const User = createParamDecorator(
  (data: keyof UserType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

export const Roles = createParamDecorator(
  (roles: string[], ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !roles.includes(user.role)) {
      return false;
    }

    return true;
  },
);

export const Public = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('isPublic', true, descriptor.value);
  };
};
