import { User } from './user.model';
import { Queue } from 'bullmq';
export declare class UserService {
    private userEventsQueue;
    constructor(userEventsQueue: Queue);
    private users;
    findAll(): User[];
    findById(id: string): User | undefined;
    findByEmail(email: string): User | undefined;
    create(userData: Partial<User>): User;
    update(id: string, userData: Partial<User>): User | undefined;
    delete(id: string): boolean;
}
