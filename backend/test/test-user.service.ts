import { Injectable } from '@nestjs/common';
import { User } from '../src/user/user.model';
import { UserEntity } from '../src/user/user.entity';
import { UserRole } from '../src/common/enums/user-role.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  prismaUserRoleToGraphQL,
  graphQLUserRoleToPrisma,
} from '../src/common/utils/prisma-converters';

@Injectable()
export class TestUserService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('user-events') private userEventsQueue: Queue,
  ) {}

  // Pas de onModuleInit pour éviter la création automatique de données de test

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
      orderBy: {
        createdAt: 'asc',
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

  async findByEmail(email: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { email },
    });
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

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...(updateData.email && { email: updateData.email }),
          ...(updateData.username && { username: updateData.username }),
          ...(updateData.role && {
            role: graphQLUserRoleToPrisma(updateData.role),
          }),
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
        action: 'update',
        userId: id,
        timestamp: new Date(),
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
