import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '../../common/enums/user-role.enum';

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field(() => UserRole, { defaultValue: UserRole.USER })
  role: UserRole;
}
