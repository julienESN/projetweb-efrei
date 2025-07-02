import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

describe('DocumentService', () => {
  let service: DocumentService;
  let mockQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getQueueToken('document-events'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all documents', () => {
      const documents = service.findAll();
      expect(documents).toHaveLength(2);
      expect(documents[0]).toHaveProperty('title', 'Document de test');
      expect(documents[1]).toHaveProperty('title', 'Guide utilisateur');
    });
  });

  describe('findById', () => {
    it('should return a document by id', () => {
      const document = service.findById('1');
      expect(document).toBeDefined();
      expect(document?.title).toBe('Document de test');
      expect(document?.userId).toBe('1');
    });

    it('should return undefined for non-existent document', () => {
      const document = service.findById('999');
      expect(document).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should return documents for a specific user', () => {
      const documents = service.findByUserId('1');
      expect(documents).toHaveLength(1);
      expect(documents[0].title).toBe('Document de test');
    });

    it('should return empty array for user with no documents', () => {
      const documents = service.findByUserId('999');
      expect(documents).toHaveLength(0);
    });

    it('should return multiple documents for user with many documents', () => {
      const documents = service.findByUserId('2');
      expect(documents).toHaveLength(1);
      expect(documents[0].title).toBe('Guide utilisateur');
    });
  });

  describe('create', () => {
    it('should create a new document', () => {
      const documentData = {
        title: 'Nouveau document',
        description: 'Description du nouveau document',
        fileUrl: 'https://example.com/new-file.pdf',
        userId: '1',
      };

      const newDocument = service.create(documentData);

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

    it('should create a document without fileUrl', () => {
      const documentData = {
        title: 'Document sans fichier',
        description: 'Document sans URL de fichier',
        userId: '2',
      };

      const newDocument = service.create(documentData);

      expect(newDocument.fileUrl).toBeUndefined();
      expect(newDocument.title).toBe(documentData.title);
    });

    it('should add the new document to the list', () => {
      const initialCount = service.findAll().length;

      service.create({
        title: 'Test document',
        description: 'Test description',
        userId: '1',
      });

      expect(service.findAll().length).toBe(initialCount + 1);
    });
  });

  describe('update', () => {
    it('should update an existing document', () => {
      const updateData = {
        title: 'Titre mis à jour',
        description: 'Description mise à jour',
      };

      const updatedDocument = service.update('1', updateData);

      expect(updatedDocument).toBeDefined();
      expect(updatedDocument?.id).toBe('1');
      expect(updatedDocument?.title).toBe(updateData.title);
      expect(updatedDocument?.description).toBe(updateData.description);
      expect(updatedDocument?.userId).toBe('1'); // Doit rester inchangé
      expect(updatedDocument?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return undefined for non-existent document', () => {
      const updateData = { title: 'Titre mis à jour' };
      const result = service.update('999', updateData);

      expect(result).toBeUndefined();
    });

    it('should preserve existing data when partially updating', () => {
      const originalDocument = service.findById('1');
      const updateData = { title: 'Nouveau titre seulement' };

      const updatedDocument = service.update('1', updateData);

      expect(updatedDocument?.description).toBe(originalDocument?.description);
      expect(updatedDocument?.fileUrl).toBe(originalDocument?.fileUrl);
      expect(updatedDocument?.userId).toBe(originalDocument?.userId);
      expect(updatedDocument?.title).toBe(updateData.title);
    });
  });

  describe('delete', () => {
    it('should delete an existing document', () => {
      const initialCount = service.findAll().length;
      const result = service.delete('2');

      expect(result).toBe(true);
      expect(service.findAll().length).toBe(initialCount - 1);
      expect(service.findById('2')).toBeUndefined();

      // Vérifier que l'événement a été ajouté à la queue
      expect(mockQueue.add).toHaveBeenCalledWith('document-event', {
        action: 'delete',
        documentId: '2',
        timestamp: expect.any(Date),
      });
    });

    it('should return false for non-existent document', () => {
      const initialCount = service.findAll().length;
      const result = service.delete('999');

      expect(result).toBe(false);
      expect(service.findAll().length).toBe(initialCount);
    });
  });
});
