// get-user.decorator.ts
import { User } from '@app/users/entities/user.entity';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  <K extends keyof User>(
    key: K | undefined,
    ctx: ExecutionContext,
  ): User | User[K] => {
    const request = ctx.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    return key ? user[key] : user;
  },
);
