import { Injectable } from '@nestjs/common';
import { Document } from '../src/document/document.model';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../src/prisma/prisma.service';

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
export class TestDocumentService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('document-events') private documentEventsQueue: Queue,
  ) {}

  // Pas de onModuleInit pour éviter la création automatique de données de test

  async findAll(): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    return documents.map((doc: PrismaDocument) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      fileUrl: doc.fileUrl || undefined,
      userId: doc.userId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async findById(id: string): Promise<Document | null> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) return null;

    return {
      id: document.id,
      title: document.title,
      description: document.description,
      fileUrl: document.fileUrl || undefined,
      userId: document.userId,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  async findByUserId(userId: string): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return documents.map((doc: PrismaDocument) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      fileUrl: doc.fileUrl || undefined,
      userId: doc.userId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async create(documentData: {
    title: string;
    description: string;
    fileUrl?: string;
    userId: string;
  }): Promise<Document> {
    const newDocument = await this.prisma.document.create({
      data: {
        title: documentData.title,
        description: documentData.description,
        fileUrl: documentData.fileUrl || null,
        userId: documentData.userId,
      },
    });

    void this.documentEventsQueue.add('document-event', {
      action: 'create',
      documentId: newDocument.id,
      timestamp: new Date(),
    });

    return {
      id: newDocument.id,
      title: newDocument.title,
      description: newDocument.description,
      fileUrl: newDocument.fileUrl || undefined,
      userId: newDocument.userId,
      createdAt: newDocument.createdAt,
      updatedAt: newDocument.updatedAt,
    };
  }

  async update(
    id: string,
    updateData: {
      title?: string;
      description?: string;
      fileUrl?: string;
    },
  ): Promise<Document | null> {
    try {
      const updatedDocument = await this.prisma.document.update({
        where: { id },
        data: {
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.description && {
            description: updateData.description,
          }),
          ...(updateData.fileUrl !== undefined && {
            fileUrl: updateData.fileUrl || null,
          }),
        },
      });

      void this.documentEventsQueue.add('document-event', {
        action: 'update',
        documentId: id,
        timestamp: new Date(),
      });

      return {
        id: updatedDocument.id,
        title: updatedDocument.title,
        description: updatedDocument.description,
        fileUrl: updatedDocument.fileUrl || undefined,
        userId: updatedDocument.userId,
        createdAt: updatedDocument.createdAt,
        updatedAt: updatedDocument.updatedAt,
      };
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
