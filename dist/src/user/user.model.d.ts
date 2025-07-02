import { UserRole } from '../common/enums/user-role.enum';
export declare class User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
