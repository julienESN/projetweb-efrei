import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppModule } from './test-app.module';
import { TestDatabaseService } from './test-database.service';

describe('GraphQL (e2e)', () => {
  let app: INestApplication;
  let testDbService: TestDatabaseService;
  let adminToken: string;
  let adminUserId: string;
  let regularUserId: string;
  let doc1Id: string;
  let doc2Id: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    testDbService = moduleFixture.get<TestDatabaseService>(TestDatabaseService);

    await app.init();

    // Nettoyer et réinitialiser la base de données
    const { adminUser, regularUser } = await testDbService.resetDatabase();
    adminUserId = adminUser.id;
    regularUserId = regularUser.id;
    doc1Id = 'test-doc-1-id';
    doc2Id = 'test-doc-2-id';

    // Obtenir un token admin pour les tests d'authentification
    const loginResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(loginInput: { email: "admin@example.com", password: "password" }) {
              access_token
              user {
                id
                email
                role
              }
            }
          }
        `,
      });

    adminToken = loginResponse.body.data.login.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  // Test du ping original (étape 3) - pas d'auth requise
  it('should return "ok" for result query', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            result
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.result).toBe('ok');
      });
  });

  // Tests des utilisateurs
  describe('Users', () => {
    it('should return all users', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query {
              users {
                id
                email
                username
                role
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.users).toHaveLength(2);
          const users: any[] = res.body.data.users;

          // Vérifier que admin et user sont présents
          const adminUser = users.find(
            (u: any) => u.email === 'admin@example.com',
          );
          const regularUser = users.find(
            (u: any) => u.email === 'user@example.com',
          );

          expect(adminUser).toBeDefined();
          expect(adminUser.role).toBe('ADMIN');
          expect(adminUser.username).toBe('admin');

          expect(regularUser).toBeDefined();
          expect(regularUser.role).toBe('USER');
          expect(regularUser.username).toBe('user');
        });
    });

    it('should return user by id', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query($id: String!) {
              user(id: $id) {
                id
                email
                username
                role
              }
            }
          `,
          variables: { id: adminUserId },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.user.id).toBe(adminUserId);
          expect(res.body.data.user.email).toBe('admin@example.com');
          expect(res.body.data.user.role).toBe('ADMIN');
        });
    });

    it('should create a new user', () => {
      const timestamp = Date.now();
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            mutation($createUserInput: CreateUserInput!) {
              createUser(createUserInput: $createUserInput) {
                id
                email
                username
                role
              }
            }
          `,
          variables: {
            createUserInput: {
              email: `test-${timestamp}@example.com`,
              username: `testuser-${timestamp}`,
              role: 'USER',
            },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createUser.email).toBe(
            `test-${timestamp}@example.com`,
          );
          expect(res.body.data.createUser.username).toBe(
            `testuser-${timestamp}`,
          );
          expect(res.body.data.createUser.role).toBe('USER');
          expect(res.body.data.createUser.id).toBeDefined();
        });
    });
  });

  // Tests des documents
  describe('Documents', () => {
    it('should return all documents', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query {
              documents {
                id
                title
                description
                fileUrl
                userId
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.documents).toHaveLength(2);

          const documents: any[] = res.body.data.documents;
          const doc1 = documents.find(
            (d: any) => d.title === 'Document de test',
          );
          const doc2 = documents.find(
            (d: any) => d.title === 'Guide utilisateur',
          );

          expect(doc1).toBeDefined();
          expect(doc1.description).toBe('Ceci est un document de test');
          expect(doc1.userId).toBe(adminUserId);

          expect(doc2).toBeDefined();
          expect(doc2.description).toBe('Guide pour les nouveaux utilisateurs');
          expect(doc2.userId).toBe(regularUserId);
        });
    });

    it('should return documents by user id (API requise)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query($userId: String!) {
              getDocumentsByUser(userId: $userId) {
                id
                title
                description
                userId
              }
            }
          `,
          variables: { userId: adminUserId },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getDocumentsByUser).toHaveLength(1);
          expect(res.body.data.getDocumentsByUser[0].userId).toBe(adminUserId);
          expect(res.body.data.getDocumentsByUser[0].title).toBe(
            'Document de test',
          );
        });
    });

    it('should return document by id (API requise)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query($id: String!) {
              getDocumentById(id: $id) {
                id
                title
                description
                userId
              }
            }
          `,
          variables: { id: doc1Id },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getDocumentById.id).toBe(doc1Id);
          expect(res.body.data.getDocumentById.title).toBe('Document de test');
          expect(res.body.data.getDocumentById.userId).toBe(adminUserId);
        });
    });

    it('should create a new document (API requise)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            mutation($createDocumentInput: CreateDocumentInput!) {
              createDocument(createDocumentInput: $createDocumentInput) {
                id
                title
                description
                fileUrl
                userId
              }
            }
          `,
          variables: {
            createDocumentInput: {
              title: 'Nouveau document test',
              description: 'Description de test',
              fileUrl: 'http://example.com/test.pdf',
              userId: adminUserId,
            },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createDocument.title).toBe(
            'Nouveau document test',
          );
          expect(res.body.data.createDocument.description).toBe(
            'Description de test',
          );
          expect(res.body.data.createDocument.fileUrl).toBe(
            'http://example.com/test.pdf',
          );
          expect(res.body.data.createDocument.userId).toBe(adminUserId);
          expect(res.body.data.createDocument.id).toBeDefined();
        });
    });

    it('should delete a document (API requise)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            mutation($id: String!) {
              deleteDocument(id: $id)
            }
          `,
          variables: { id: doc2Id },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.deleteDocument).toBe(true);
        });
    });

    it('should update a document', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            mutation($id: String!, $updateDocumentInput: UpdateDocumentInput!) {
              updateDocument(id: $id, updateDocumentInput: $updateDocumentInput) {
                id
                title
                description
              }
            }
          `,
          variables: {
            id: doc1Id,
            updateDocumentInput: { title: 'Titre modifié' },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.updateDocument.id).toBe(doc1Id);
          expect(res.body.data.updateDocument.title).toBe('Titre modifié');
        });
    });
  });

  // Test UserRole enum
  it('should handle UserRole enum correctly', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
          query {
            users {
              role
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        const users = res.body.data.users as Array<{ role: string }>;
        const roles = users.map((user) => user.role);
        expect(roles).toContain('ADMIN');
        expect(roles).toContain('USER');
        expect(roles).not.toContain('admin'); // Test que ce n'est pas en minuscules
        expect(roles).not.toContain('user');
      });
  });
});
