import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

@Injectable()
export class TestDatabaseService {
  constructor(private prisma: PrismaService) {}

  async cleanDatabase() {
    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    await this.prisma.logs.deleteMany();
    await this.prisma.document.deleteMany();
    await this.prisma.user.deleteMany();
  }

  async seedDatabase() {
    // Créer les utilisateurs de test avec des IDs prévisibles
    const adminUser = await this.prisma.user.create({
      data: {
        id: 'test-admin-id',
        email: 'admin@example.com',
        username: 'admin',
        password:
          '$2b$10$.7IkY1plF6z2DkwSZV3L0OJzWphTcCsh270i5q6RuajxHjf6xo5uu', // 'password' hashé
        role: 'ADMIN',
      },
    });

    const regularUser = await this.prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'user@example.com',
        username: 'user',
        password:
          '$2b$10$.7IkY1plF6z2DkwSZV3L0OJzWphTcCsh270i5q6RuajxHjf6xo5uu', // 'password' hashé
        role: 'USER',
      },
    });

    // Créer les documents de test
    await this.prisma.document.create({
      data: {
        id: 'test-doc-1-id',
        title: 'Document de test',
        description: 'Ceci est un document de test',
        fileUrl: 'https://example.com/file1.pdf',
        userId: adminUser.id,
      },
    });

    await this.prisma.document.create({
      data: {
        id: 'test-doc-2-id',
        title: 'Guide utilisateur',
        description: 'Guide pour les nouveaux utilisateurs',
        fileUrl: null,
        userId: regularUser.id,
      },
    });

    return {
      adminUser,
      regularUser,
    };
  }

  async resetDatabase() {
    await this.cleanDatabase();
    return await this.seedDatabase();
  }
}
