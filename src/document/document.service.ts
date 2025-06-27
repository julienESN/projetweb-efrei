import { Injectable } from '@nestjs/common';
import { Document } from './document.model';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DocumentService {
  constructor(
    @InjectQueue('document-events') private documentEventsQueue: Queue,
  ) {}

  private documents: Document[] = [
    {
      id: '1',
      title: 'Document de test',
      description: 'Ceci est un document de test',
      fileUrl: 'https://example.com/file1.pdf',
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Guide utilisateur',
      description: 'Guide pour les nouveaux utilisateurs',
      fileUrl: undefined,
      userId: '2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findAll(): Document[] {
    return this.documents;
  }

  findById(id: string): Document | undefined {
    return this.documents.find((doc) => doc.id === id);
  }

  findByUserId(userId: string): Document[] {
    return this.documents.filter((doc) => doc.userId === userId);
  }

  create(documentData: Partial<Document>): Document {
    const newDocument: Document = {
      id: (this.documents.length + 1).toString(),
      title: documentData.title!,
      description: documentData.description!,
      fileUrl: documentData.fileUrl || undefined,
      userId: documentData.userId!,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.documents.push(newDocument);

    void this.documentEventsQueue.add('document-event', {
      action: 'create',
      documentId: newDocument.id,
      timestamp: new Date(),
    });

    return newDocument;
  }

  update(id: string, documentData: Partial<Document>): Document | undefined {
    const docIndex = this.documents.findIndex((doc) => doc.id === id);
    if (docIndex === -1) return undefined;

    this.documents[docIndex] = {
      ...this.documents[docIndex],
      ...documentData,
      updatedAt: new Date(),
    };

    return this.documents[docIndex];
  }

  delete(id: string): boolean {
    const docIndex = this.documents.findIndex((doc) => doc.id === id);
    if (docIndex === -1) return false;

    this.documents.splice(docIndex, 1);

    void this.documentEventsQueue.add('document-event', {
      action: 'delete',
      documentId: id,
      timestamp: new Date(),
    });

    return true;
  }
}
