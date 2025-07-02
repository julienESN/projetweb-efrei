import { User } from './user.model';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
export declare class UserResolver {
    private readonly userService;
    constructor(userService: UserService);
    findAll(): User[];
    findOne(id: string): User | undefined;
    createUser(createUserInput: CreateUserInput): User;
    updateUser(id: string, updateUserInput: UpdateUserInput): User | undefined;
    deleteUser(id: string): boolean;
}
