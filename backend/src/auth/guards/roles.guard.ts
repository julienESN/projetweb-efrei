import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '../../common/enums/user-role.enum';

interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

interface GraphQLContext {
  req: {
    user: AuthenticatedUser;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    // Pour GraphQL
    const ctx = GqlExecutionContext.create(context);
    const graphqlContext = ctx.getContext<GraphQLContext>();
    const user = graphqlContext.req.user;

    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
