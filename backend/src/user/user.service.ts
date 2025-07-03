import { Injectable, OnModuleInit } from '@nestjs/common';
import { User } from './user.model';
import { UserEntity } from './user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  prismaUserRoleToGraphQL,
  graphQLUserRoleToPrisma,
} from '../common/utils/prisma-converters';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('user-events') private userEventsQueue: Queue,
  ) {}

  async onModuleInit() {
    // Créer des utilisateurs de test s'ils n'existent pas
    await this.createDefaultUsers();
  }

  private async createDefaultUsers() {
    try {
      const existingUsers = await this.prisma.user.count();

      if (existingUsers === 0) {
        // Créer utilisateur admin par défaut
        const adminHashedPassword = await bcrypt.hash('password', 10);
        await this.prisma.user.create({
          data: {
            email: 'admin@example.com',
            username: 'admin',
            password: adminHashedPassword,
            role: 'ADMIN',
          },
        });

        // Créer utilisateur standard par défaut
        const userHashedPassword = await bcrypt.hash('password', 10);
        await this.prisma.user.create({
          data: {
            email: 'user@example.com',
            username: 'user',
            password: userHashedPassword,
            role: 'USER',
          },
        });
      }
    } catch (error) {
      // En cas d'erreur de DB, on continue sans créer les utilisateurs par défaut
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      console.warn(
        'Impossible de créer les utilisateurs par défaut:',
        errorMessage,
      );
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users.map((user) => ({
      ...user,
      role: prismaUserRoleToGraphQL(user.role),
    }));
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      role: prismaUserRoleToGraphQL(user.role),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      role: prismaUserRoleToGraphQL(user.role),
    };
  }

  // Méthode pour l'authentification (inclut le password)
  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      ...user,
      role: prismaUserRoleToGraphQL(user.role),
    };
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = await this.prisma.user.create({
      data: {
        email: userData.email!,
        username: userData.username!,
        password: '', // Pas de password dans cette méthode
        role: userData.role ? graphQLUserRoleToPrisma(userData.role) : 'USER',
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    void this.userEventsQueue.add('user-event', {
      action: 'create',
      userId: newUser.id,
      timestamp: new Date(),
    });

    return {
      ...newUser,
      role: prismaUserRoleToGraphQL(newUser.role),
    };
  }

  // Méthode pour créer avec password
  async createWithPassword(userData: {
    email: string;
    username: string;
    password: string;
    role: UserRole;
  }): Promise<UserEntity> {
    const newUser = await this.prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        role: graphQLUserRoleToPrisma(userData.role),
      },
    });

    void this.userEventsQueue.add('user-event', {
      action: 'create',
      userId: newUser.id,
      timestamp: new Date(),
    });

    return {
      ...newUser,
      role: prismaUserRoleToGraphQL(newUser.role),
    };
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          email: userData.email,
          username: userData.username,
          role: userData.role
            ? graphQLUserRoleToPrisma(userData.role)
            : undefined,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        ...updatedUser,
        role: prismaUserRoleToGraphQL(updatedUser.role),
      };
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      void this.userEventsQueue.add('user-event', {
        action: 'delete',
        userId: id,
        timestamp: new Date(),
      });

      return true;
    } catch {
      return false;
    }
  }
}
