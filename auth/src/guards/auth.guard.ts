import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Role } from 'src/dto/create-user.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private roleParam?: Role) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const jwt = request.headers['authorization']?.split(' ')[1];

    if (!jwt) {
      return false;
    }

    const user: any = verify(jwt, 'secret');
    if (!user || !user.data?.id || !user.data?.role) {
      return false;
    }

    if (!this.roleParam) {
      request.user = user.data;
      return true;
    }

    const role = user.data?.role;

    if (role !== this.roleParam) {
      return false;
    }

    request.user = user.data;
    return true;
  }
}

// user {
//   exp: 1676998375463,
//   data: { id: '7297b20b-8989-42c4-9b0d-1b39dbe5d50e', role: 'USER' },
//   iat: 1676998116
// }
