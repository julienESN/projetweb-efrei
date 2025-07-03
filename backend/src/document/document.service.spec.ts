import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

describe('DocumentService', () => {
  let service: DocumentService;
  let mockQueue: jest.Mocked<Queue>;
  let prismaService: PrismaService;

  const mockDocuments = [
    {
      id: '1',
      title: 'Document 1',
      description: 'Description 1',
      fileUrl: 'url1',
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Document 2',
      description: 'Description 2',
      fileUrl: null,
      userId: '2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: PrismaService,
          useValue: {
            document: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $disconnect: jest.fn(),
          },
        },
        {
          provide: getQueueToken('document-events'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all documents', async () => {
      jest
        .spyOn(prismaService.document, 'findMany')
        .mockResolvedValue(mockDocuments as any);

      const documents = await service.findAll();
      expect(documents).toHaveLength(2);
      expect(documents[0]).toHaveProperty('title', 'Document 1');
      expect(documents[1]).toHaveProperty('title', 'Document 2');
    });
  });

  describe('findById', () => {
    it('should return a document by id', async () => {
      jest
        .spyOn(prismaService.document, 'findUnique')
        .mockResolvedValue(mockDocuments[0] as any);

      const document = await service.findById('1');
      expect(document).toBeDefined();
      expect(document?.title).toBe('Document 1');
      expect(document?.userId).toBe('1');
    });

    it('should return null for non-existent document', async () => {
      jest.spyOn(prismaService.document, 'findUnique').mockResolvedValue(null);

      const document = await service.findById('999');
      expect(document).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return documents for a specific user', async () => {
      const userDocuments = [mockDocuments[0]];
      jest
        .spyOn(prismaService.document, 'findMany')
        .mockResolvedValue(userDocuments as any);

      const documents = await service.findByUserId('1');
      expect(documents).toHaveLength(1);
      expect(documents[0].userId).toBe('1');
    });

    it('should return empty array for user with no documents', async () => {
      jest.spyOn(prismaService.document, 'findMany').mockResolvedValue([]);

      const documents = await service.findByUserId('999');
      expect(documents).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create a new document with fileUrl', async () => {
      const documentData = {
        title: 'Nouveau document',
        description: 'Description du nouveau document',
        fileUrl: 'http://example.com/file.pdf',
        userId: '1',
      };

      const mockCreatedDocument = {
        id: '3',
        ...documentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prismaService.document, 'create')
        .mockResolvedValue(mockCreatedDocument as any);

      const newDocument = await service.create(documentData);

      expect(newDocument).toBeDefined();
      expect(newDocument.id).toBe('3');
      expect(newDocument.title).toBe(documentData.title);
      expect(newDocument.description).toBe(documentData.description);
      expect(newDocument.fileUrl).toBe(documentData.fileUrl);
      expect(newDocument.userId).toBe(documentData.userId);
      expect(newDocument.createdAt).toBeInstanceOf(Date);
      expect(newDocument.updatedAt).toBeInstanceOf(Date);

      // Vérifier que l'événement a été ajouté à la queue
      expect(mockQueue.add).toHaveBeenCalledWith('document-event', {
        action: 'create',
        documentId: '3',
        timestamp: expect.any(Date),
      });
    });

    it('should create a new document without fileUrl', async () => {
      const documentData = {
        title: 'Document sans fichier',
        description: 'Description',
        userId: '2',
      };

      const mockCreatedDocument = {
        id: '4',
        title: documentData.title,
        description: documentData.description,
        fileUrl: null,
        userId: documentData.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prismaService.document, 'create')
        .mockResolvedValue(mockCreatedDocument as any);

      const newDocument = await service.create(documentData);

      expect(newDocument.fileUrl).toBeUndefined();
      expect(newDocument.title).toBe(documentData.title);
    });
  });

  describe('update', () => {
    it('should update an existing document', async () => {
      const updateData = {
        title: 'Titre mis à jour',
        description: 'Description mise à jour',
      };

      const mockUpdatedDocument = {
        id: '1',
        title: 'Titre mis à jour',
        description: 'Description mise à jour',
        fileUrl: 'original-url',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prismaService.document, 'update')
        .mockResolvedValue(mockUpdatedDocument as any);

      const updatedDocument = await service.update('1', updateData);

      expect(updatedDocument).toBeDefined();
      expect(updatedDocument?.id).toBe('1');
      expect(updatedDocument?.title).toBe(updateData.title);
      expect(updatedDocument?.description).toBe(updateData.description);
      expect(updatedDocument?.userId).toBe('1');
      expect(updatedDocument?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent document', async () => {
      const updateData = { title: 'Titre mis à jour' };
      jest
        .spyOn(prismaService.document, 'update')
        .mockRejectedValue(new Error('Record not found'));

      const result = await service.update('999', updateData);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing document', async () => {
      jest.spyOn(prismaService.document, 'delete').mockResolvedValue({} as any);

      const result = await service.delete('2');

      expect(result).toBe(true);

      // Vérifier que l'événement a été ajouté à la queue
      expect(mockQueue.add).toHaveBeenCalledWith('document-event', {
        action: 'delete',
        documentId: '2',
        timestamp: expect.any(Date),
      });
    });

    it('should return false for non-existent document', async () => {
      jest
        .spyOn(prismaService.document, 'delete')
        .mockRejectedValue(new Error('Record not found'));

      const result = await service.delete('999');

      expect(result).toBe(false);
    });
  });
});
