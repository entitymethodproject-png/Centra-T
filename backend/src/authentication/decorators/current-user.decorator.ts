import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthSession } from '../authentication.service';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthSession => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
