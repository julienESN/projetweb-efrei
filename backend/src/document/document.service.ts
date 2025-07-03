import { Injectable, OnModuleInit } from '@nestjs/common';
import { Document } from './document.model';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

interface PrismaDocument {
  id: string;
  title: string;
  description: string;
  fileUrl: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DocumentService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('document-events') private documentEventsQueue: Queue,
  ) {}

  async onModuleInit() {
    // Créer des documents de test s'ils n'existent pas
    await this.createDefaultDocuments();
  }

  private async createDefaultDocuments() {
    try {
      const existingDocuments = await this.prisma.document.count();

      if (existingDocuments === 0) {
        // Récupérer les utilisateurs par défaut pour associer les documents
        const adminUser = await this.prisma.user.findUnique({
          where: { email: 'admin@example.com' },
        });

        const regularUser = await this.prisma.user.findUnique({
          where: { email: 'user@example.com' },
        });

        if (adminUser) {
          await this.prisma.document.create({
            data: {
              title: 'Document de test',
              description: 'Ceci est un document de test',
              fileUrl: 'https://example.com/file1.pdf',
              userId: adminUser.id,
            },
          });
        }

        if (regularUser) {
          await this.prisma.document.create({
            data: {
              title: 'Guide utilisateur',
              description: 'Guide pour les nouveaux utilisateurs',
              fileUrl: null,
              userId: regularUser.id,
            },
          });
        }
      }
    } catch (error) {
      // En cas d'erreur de DB, on continue sans créer les documents par défaut
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      console.warn(
        'Impossible de créer les documents par défaut:',
        errorMessage,
      );
    }
  }

  private convertPrismaToGraphQL(doc: PrismaDocument): Document {
    return {
      ...doc,
      fileUrl: doc.fileUrl || undefined, // Convertir null en undefined
    };
  }

  async findAll(): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return documents.map((doc) => this.convertPrismaToGraphQL(doc));
  }

  async findById(id: string): Promise<Document | null> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });
    return document ? this.convertPrismaToGraphQL(document) : null;
  }

  async findByUserId(userId: string): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return documents.map((doc) => this.convertPrismaToGraphQL(doc));
  }

  async create(documentData: Partial<Document>): Promise<Document> {
    const newDocument = await this.prisma.document.create({
      data: {
        title: documentData.title!,
        description: documentData.description!,
        fileUrl: documentData.fileUrl || null,
        userId: documentData.userId!,
      },
    });

    void this.documentEventsQueue.add('document-event', {
      action: 'create',
      documentId: newDocument.id,
      timestamp: new Date(),
    });

    return this.convertPrismaToGraphQL(newDocument);
  }

  async update(
    id: string,
    documentData: Partial<Document>,
  ): Promise<Document | null> {
    try {
      const updatedDocument = await this.prisma.document.update({
        where: { id },
        data: {
          title: documentData.title,
          description: documentData.description,
          fileUrl: documentData.fileUrl || null,
        },
      });
      return this.convertPrismaToGraphQL(updatedDocument);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.document.delete({
        where: { id },
      });

      void this.documentEventsQueue.add('document-event', {
        action: 'delete',
        documentId: id,
        timestamp: new Date(),
      });

      return true;
    } catch {
      return false;
    }
  }
}
