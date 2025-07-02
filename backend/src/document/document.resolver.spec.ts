import { Test, TestingModule } from '@nestjs/testing';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { getQueueToken } from '@nestjs/bullmq';
import { UserRole } from '../common/enums/user-role.enum';

describe('DocumentResolver', () => {
  let resolver: DocumentResolver;
  let documentService: jest.Mocked<DocumentService>;

  const mockDocuments = [
    {
      id: '1',
      title: 'Document de test',
      description: 'Description du document de test',
      fileUrl: 'https://example.com/doc1.pdf',
      userId: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: 'Guide utilisateur',
      description: 'Guide pour les utilisateurs',
      fileUrl: 'https://example.com/guide.pdf',
      userId: '1',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const mockQueue = {
    add: jest.fn(),
  };

  // Mock d'utilisateurs pour les tests
  const mockAdminUser = {
    userId: '1',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const mockRegularUser = {
    userId: '2',
    email: 'user@example.com',
    role: UserRole.USER,
  };

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
        {
          provide: getQueueToken('document-events'),
          useValue: mockQueue,
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
      expect(documentService.findAll).toHaveBeenCalled();
    });
  });

  describe('getDocumentsByUser', () => {
    it('should return documents for a user when requested by admin', () => {
      const userId = '1';
      const userDocuments = [mockDocuments[0]];
      documentService.findByUserId.mockReturnValue(userDocuments);

      const result = resolver.getDocumentsByUser(userId, mockAdminUser);

      expect(result).toEqual(userDocuments);
      expect(documentService.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return documents when user requests their own documents', () => {
      const userId = '2';
      documentService.findByUserId.mockReturnValue([]);

      const result = resolver.getDocumentsByUser(userId, mockRegularUser);

      expect(result).toEqual([]);
      expect(documentService.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should throw error when user tries to access other user documents', () => {
      const userId = '1'; // Trying to access admin's documents

      expect(() => {
        resolver.getDocumentsByUser(userId, mockRegularUser);
      }).toThrow('Vous ne pouvez voir que vos propres documents');
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
    it('should create a new document with current user ID', () => {
      const createDocumentInput: CreateDocumentInput = {
        title: 'Nouveau document',
        description: 'Description du nouveau document',
        fileUrl: 'https://example.com/new.pdf',
        userId: '999', // This should be ignored and replaced with currentUser.userId
      };

      const expectedDocument = {
        id: '3',
        title: 'Nouveau document',
        description: 'Description du nouveau document',
        fileUrl: 'https://example.com/new.pdf',
        userId: mockAdminUser.userId, // Should be replaced
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      documentService.create.mockReturnValue(expectedDocument);

      const result = resolver.createDocument(
        createDocumentInput,
        mockAdminUser,
      );

      expect(result).toEqual(expectedDocument);
      expect(documentService.create).toHaveBeenCalledWith({
        ...createDocumentInput,
        userId: mockAdminUser.userId, // Should use currentUser.userId
      });
    });

    it('should create document for regular user', () => {
      const createDocumentInput: CreateDocumentInput = {
        title: 'Document utilisateur',
        description: 'Document créé par utilisateur',
        fileUrl: 'https://example.com/user.pdf',
        userId: '1', // This should be ignored
      };

      const expectedDocument = {
        id: '3',
        title: 'Document utilisateur',
        description: 'Document créé par utilisateur',
        fileUrl: 'https://example.com/user.pdf',
        userId: mockRegularUser.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      documentService.create.mockReturnValue(expectedDocument);

      const result = resolver.createDocument(
        createDocumentInput,
        mockRegularUser,
      );

      expect(result).toEqual(expectedDocument);
      expect(documentService.create).toHaveBeenCalledWith({
        ...createDocumentInput,
        userId: mockRegularUser.userId, // Should use currentUser.userId
      });
    });
  });

  describe('updateDocument', () => {
    it('should update a document when user owns it', () => {
      const documentId = '1';
      const updateDocumentInput: UpdateDocumentInput = {
        title: 'Titre mis à jour',
      };

      const expectedDocument = {
        ...mockDocuments[0],
        ...updateDocumentInput,
        updatedAt: new Date(),
      };

      // Mock findById to return the document (user owns it)
      documentService.findById.mockReturnValue(mockDocuments[0]);
      documentService.update.mockReturnValue(expectedDocument);

      const result = resolver.updateDocument(
        documentId,
        updateDocumentInput,
        mockAdminUser,
      );

      expect(result).toEqual(expectedDocument);
      expect(documentService.findById).toHaveBeenCalledWith(documentId);
      expect(documentService.update).toHaveBeenCalledWith(
        documentId,
        updateDocumentInput,
      );
    });

    it('should allow admin to update any document', () => {
      const documentId = '1';
      const updateDocumentInput: UpdateDocumentInput = {
        title: 'Admin update',
      };

      const expectedDocument = {
        ...mockDocuments[0],
        ...updateDocumentInput,
        updatedAt: new Date(),
      };

      documentService.findById.mockReturnValue(mockDocuments[0]);
      documentService.update.mockReturnValue(expectedDocument);

      const result = resolver.updateDocument(
        documentId,
        updateDocumentInput,
        mockAdminUser,
      );

      expect(result).toEqual(expectedDocument);
      expect(documentService.update).toHaveBeenCalledWith(
        documentId,
        updateDocumentInput,
      );
    });

    it('should throw error when user tries to update document they do not own', () => {
      const documentId = '1'; // Document owned by user ID '1'
      const updateDocumentInput: UpdateDocumentInput = {
        title: 'Unauthorized update',
      };

      // Mock findById to return the document owned by user '1'
      documentService.findById.mockReturnValue(mockDocuments[0]);

      expect(() => {
        resolver.updateDocument(
          documentId,
          updateDocumentInput,
          mockRegularUser,
        );
      }).toThrow('Vous ne pouvez modifier que vos propres documents');
    });

    it('should throw error for non-existent document', () => {
      const documentId = '999';
      const updateDocumentInput: UpdateDocumentInput = {
        title: 'Update non-existent',
      };

      documentService.findById.mockReturnValue(undefined);

      expect(() => {
        resolver.updateDocument(documentId, updateDocumentInput, mockAdminUser);
      }).toThrow('Document non trouvé');
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document when user owns it', () => {
      const documentId = '1';

      documentService.findById.mockReturnValue(mockDocuments[0]);
      documentService.delete.mockReturnValue(true);

      const result = resolver.deleteDocument(documentId, mockAdminUser);

      expect(result).toBe(true);
      expect(documentService.delete).toHaveBeenCalledWith(documentId);
    });

    it('should throw error when user tries to delete document they do not own', () => {
      const documentId = '1'; // Document owned by user ID '1'

      documentService.findById.mockReturnValue(mockDocuments[0]);

      expect(() => {
        resolver.deleteDocument(documentId, mockRegularUser);
      }).toThrow('Vous ne pouvez supprimer que vos propres documents');
    });

    it('should throw error for non-existent document', () => {
      const documentId = '999';

      documentService.findById.mockReturnValue(undefined);

      expect(() => {
        resolver.deleteDocument(documentId, mockAdminUser);
      }).toThrow('Document non trouvé');
    });
  });
});
