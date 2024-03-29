import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Reflector, SetMetadata } from '@joktec/core';
import { UserRole } from '../../modules/users';
import { Request } from '../models';

@Injectable()
export class RoleGuard implements CanActivate {
  public static ROLES_KEY = 'roles';

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req.loggedUser) throw new ForbiddenException('PERMISSION_DENIED');

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(RoleGuard.ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const isActive = requiredRoles.some(role => req.loggedUser.role === role);
    if (!isActive) throw new ForbiddenException('PERMISSION_DENIED');
    return true;
  }
}

export const Roles = (...roles: UserRole[]) => SetMetadata(RoleGuard.ROLES_KEY, roles);
