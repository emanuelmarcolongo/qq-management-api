import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadUserInfo } from 'src/models/UserModels';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PayloadUserInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
