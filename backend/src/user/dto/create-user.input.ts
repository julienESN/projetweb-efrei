import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '../../common/enums/user-role.enum';

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field(() => UserRole, { defaultValue: UserRole.USER })
  role: UserRole;
}
