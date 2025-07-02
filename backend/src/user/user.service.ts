import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { UserEntity } from './user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UserService {
  constructor(@InjectQueue('user-events') private userEventsQueue: Queue) {}

  private users: UserEntity[] = [
    {
      id: '1',
      email: 'admin@example.com',
      username: 'admin',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      email: 'user@example.com',
      username: 'user',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findAll(): User[] {
    // Convertir UserEntity vers User (sans password)
    return this.users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  findById(id: string): User | undefined {
    const user = this.users.find((user) => user.id === id);
    if (!user) return undefined;

    // Convertir UserEntity vers User (sans password)
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  findByEmail(email: string): User | undefined {
    const user = this.users.find((user) => user.email === email);
    if (!user) return undefined;

    // Convertir UserEntity vers User (sans password)
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Nouvelle méthode pour l'authentification (inclut le password)
  findByEmailWithPassword(email: string): UserEntity | undefined {
    return this.users.find((user) => user.email === email);
  }

  create(userData: Partial<User>): User {
    const newUser: UserEntity = {
      id: (this.users.length + 1).toString(),
      email: userData.email!,
      username: userData.username!,
      password: '', // Pas de password dans cette méthode
      role: userData.role || UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);

    void this.userEventsQueue.add('user-event', {
      action: 'create',
      userId: newUser.id,
      timestamp: new Date(),
    });

    // Retourner User (sans password)
    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }

  // Nouvelle méthode pour créer avec password
  createWithPassword(userData: {
    email: string;
    username: string;
    password: string;
    role: UserRole;
  }): UserEntity {
    const newUser: UserEntity = {
      id: (this.users.length + 1).toString(),
      email: userData.email,
      username: userData.username,
      password: userData.password,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);

    void this.userEventsQueue.add('user-event', {
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

    // Retourner User (sans password)
    const updatedUser = this.users[userIndex];
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  delete(id: string): boolean {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);

    void this.userEventsQueue.add('user-event', {
      action: 'delete',
      userId: id,
      timestamp: new Date(),
    });

    return true;
  }
}
