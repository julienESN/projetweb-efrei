import { Test, TestingModule } from '@nestjs/testing';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';

describe('DocumentResolver', () => {
  let resolver: DocumentResolver;
  let documentService: jest.Mocked<DocumentService>;

  const mockDocuments = [
    {
      id: '1',
      title: 'Document de test',
      description: 'Ceci est un document de test',
      fileUrl: 'https://example.com/file1.pdf',
      userId: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: 'Guide utilisateur',
      description: 'Guide pour les nouveaux utilisateurs',
      fileUrl: undefined,
      userId: '2',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(async () => {
    const mockDocumentService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentResolver,
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    resolver = module.get<DocumentResolver>(DocumentResolver);
    documentService = module.get(DocumentService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all documents', () => {
      documentService.findAll.mockReturnValue(mockDocuments);

      const result = resolver.findAll();

      expect(result).toEqual(mockDocuments);
      expect(documentService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no documents exist', () => {
      documentService.findAll.mockReturnValue([]);

      const result = resolver.findAll();

      expect(result).toEqual([]);
      expect(documentService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDocumentsByUser', () => {
    it('should return documents for a specific user', () => {
      const userId = '1';
      const userDocuments = [mockDocuments[0]];
      documentService.findByUserId.mockReturnValue(userDocuments);

      const result = resolver.getDocumentsByUser(userId);

      expect(result).toEqual(userDocuments);
      expect(documentService.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return empty array for user with no documents', () => {
      const userId = '999';
      documentService.findByUserId.mockReturnValue([]);

      const result = resolver.getDocumentsByUser(userId);

      expect(result).toEqual([]);
      expect(documentService.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('getDocumentById', () => {
    it('should return a document by id', () => {
      const documentId = '1';
      documentService.findById.mockReturnValue(mockDocuments[0]);

      const result = resolver.getDocumentById(documentId);

      expect(result).toEqual(mockDocuments[0]);
      expect(documentService.findById).toHaveBeenCalledWith(documentId);
    });

    it('should return undefined for non-existent document', () => {
      const documentId = '999';
      documentService.findById.mockReturnValue(undefined);

      const result = resolver.getDocumentById(documentId);

      expect(result).toBeUndefined();
      expect(documentService.findById).toHaveBeenCalledWith(documentId);
    });
  });

  describe('createDocument', () => {
    it('should create a new document with fileUrl', () => {
      const createDocumentInput: CreateDocumentInput = {
        title: 'Nouveau document',
        description: 'Description du nouveau document',
        fileUrl: 'https://example.com/new-file.pdf',
        userId: '1',
      };

      const expectedDocument = {
        id: '3',
        ...createDocumentInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      documentService.create.mockReturnValue(expectedDocument);

      const result = resolver.createDocument(createDocumentInput);

      expect(result).toEqual(expectedDocument);
      expect(documentService.create).toHaveBeenCalledWith(createDocumentInput);
    });

    it('should create a document without fileUrl', () => {
      const createDocumentInput: CreateDocumentInput = {
        title: 'Document sans fichier',
        description: 'Document sans URL de fichier',
        userId: '2',
      };

      const expectedDocument = {
        id: '3',
        ...createDocumentInput,
        fileUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      documentService.create.mockReturnValue(expectedDocument);

      const result = resolver.createDocument(createDocumentInput);

      expect(result).toEqual(expectedDocument);
      expect(documentService.create).toHaveBeenCalledWith(createDocumentInput);
    });
  });

  describe('updateDocument', () => {
    it('should update an existing document', () => {
      const documentId = '1';
      const updateDocumentInput: UpdateDocumentInput = {
        title: 'Titre mis à jour',
        description: 'Description mise à jour',
      };

      const expectedDocument = {
        ...mockDocuments[0],
        ...updateDocumentInput,
        updatedAt: new Date(),
      };

      documentService.update.mockReturnValue(expectedDocument);

      const result = resolver.updateDocument(documentId, updateDocumentInput);

      expect(result).toEqual(expectedDocument);
      expect(documentService.update).toHaveBeenCalledWith(
        documentId,
        updateDocumentInput,
      );
    });

    it('should return undefined for non-existent document', () => {
      const documentId = '999';
      const updateDocumentInput: UpdateDocumentInput = {
        title: 'Titre inexistant',
      };

      documentService.update.mockReturnValue(undefined);

      const result = resolver.updateDocument(documentId, updateDocumentInput);

      expect(result).toBeUndefined();
      expect(documentService.update).toHaveBeenCalledWith(
        documentId,
        updateDocumentInput,
      );
    });

    it('should handle partial updates', () => {
      const documentId = '1';
      const updateDocumentInput: UpdateDocumentInput = {
        title: 'Nouveau titre seulement',
      };

      const expectedDocument = {
        ...mockDocuments[0],
        title: 'Nouveau titre seulement',
        updatedAt: new Date(),
      };

      documentService.update.mockReturnValue(expectedDocument);

      const result = resolver.updateDocument(documentId, updateDocumentInput);

      expect(result).toEqual(expectedDocument);
      expect(documentService.update).toHaveBeenCalledWith(
        documentId,
        updateDocumentInput,
      );
    });
  });

  describe('deleteDocument', () => {
    it('should delete an existing document', () => {
      const documentId = '2';
      documentService.delete.mockReturnValue(true);

      const result = resolver.deleteDocument(documentId);

      expect(result).toBe(true);
      expect(documentService.delete).toHaveBeenCalledWith(documentId);
    });

    it('should return false for non-existent document', () => {
      const documentId = '999';
      documentService.delete.mockReturnValue(false);

      const result = resolver.deleteDocument(documentId);

      expect(result).toBe(false);
      expect(documentService.delete).toHaveBeenCalledWith(documentId);
    });
  });

  describe('integration behavior', () => {
    it('should handle service errors gracefully', () => {
      const documentId = '1';
      documentService.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      expect(() => resolver.getDocumentById(documentId)).toThrow(
        'Database error',
      );
    });

    it('should pass through service return values correctly', () => {
      const createInput: CreateDocumentInput = {
        title: 'Test document',
        description: 'Test description',
        userId: '1',
      };

      const serviceResult = {
        id: '100',
        title: 'Test document',
        description: 'Test description',
        fileUrl: undefined,
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      documentService.create.mockReturnValue(serviceResult);

      const resolverResult = resolver.createDocument(createInput);

      expect(resolverResult).toBe(serviceResult);
      expect(resolverResult).toHaveProperty('id', '100');
    });
  });
});
