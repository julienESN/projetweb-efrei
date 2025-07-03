import { UserRole as GraphQLUserRole } from '../enums/user-role.enum';
import { UserRole as PrismaUserRole } from '../../../generated/prisma';

export function prismaUserRoleToGraphQL(role: PrismaUserRole): GraphQLUserRole {
  switch (role) {
    case 'ADMIN':
      return GraphQLUserRole.ADMIN;
    case 'USER':
      return GraphQLUserRole.USER;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown user role: ${role}`);
  }
}

export function graphQLUserRoleToPrisma(role: GraphQLUserRole): PrismaUserRole {
  switch (role) {
    case GraphQLUserRole.ADMIN:
      return 'ADMIN';
    case GraphQLUserRole.USER:
      return 'USER';
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown user role: ${role}`);
  }
}
