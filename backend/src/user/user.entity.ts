import { UserRole } from '../common/enums/user-role.enum';

export class UserEntity {
  id: string;
  email: string;
  username: string;
  password: string; // Ce champ ne sera jamais exposé dans GraphQL
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
