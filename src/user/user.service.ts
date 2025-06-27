import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { UserRole } from '../common/enums/user-role.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UserService {
  constructor(@InjectQueue('user-events') private userEventsQueue: Queue) {}

  private users: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      username: 'admin',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      email: 'user@example.com',
      username: 'user',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findAll(): User[] {
    return this.users;
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  create(userData: Partial<User>): User {
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      email: userData.email!,
      username: userData.username!,
      role: userData.role || UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);

    this.userEventsQueue.add('user-event', {
      action: 'create',
      userId: newUser.id,
      timestamp: new Date(),
    });

    return newUser;
  }

  update(id: string, userData: Partial<User>): User | undefined {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return undefined;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date(),
    };

    return this.users[userIndex];
  }

  delete(id: string): boolean {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);

    this.userEventsQueue.add('user-event', {
      action: 'delete',
      userId: id,
      timestamp: new Date(),
    });

    return true;
  }
}
