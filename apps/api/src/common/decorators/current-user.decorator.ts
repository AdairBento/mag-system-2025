import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface CurrentUserData {
  userId: string;
  email?: string;
  roles?: string[];
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    if (!user || !user.userId) {
      throw new Error('User not found in request');
    }

    return {
      userId: user.userId,
      email: user.email,
      roles: user.roles,
    };
  },
);
