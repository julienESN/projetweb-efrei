import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserRole } from '../common/enums/user-role.enum';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
