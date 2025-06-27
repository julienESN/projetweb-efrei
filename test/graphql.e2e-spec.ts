import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

interface GraphQLResponse<T = any> {
  body: {
    data: T;
  };
}

describe('GraphQL (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // Test du ping original (étape 3)
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
          expect(res.body.data.users[0].email).toBe('admin@example.com');
          expect(res.body.data.users[0].role).toBe('ADMIN');
          expect(res.body.data.users[1].email).toBe('user@example.com');
          expect(res.body.data.users[1].role).toBe('USER');
        });
    });

    it('should return user by id', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              user(id: "1") {
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
          expect(res.body.data.user.id).toBe('1');
          expect(res.body.data.user.email).toBe('admin@example.com');
          expect(res.body.data.user.role).toBe('ADMIN');
        });
    });

    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createUser(createUserInput: {
                email: "test@example.com"
                username: "testuser"
                role: USER
              }) {
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
          expect(res.body.data.createUser.email).toBe('test@example.com');
          expect(res.body.data.createUser.username).toBe('testuser');
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
          expect(res.body.data.documents[0].title).toBe('Document de test');
          expect(res.body.data.documents[1].title).toBe('Guide utilisateur');
        });
    });

    it('should return documents by user id (API requise)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              getDocumentsByUser(userId: "1") {
                id
                title
                description
                userId
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getDocumentsByUser).toHaveLength(1);
          expect(res.body.data.getDocumentsByUser[0].userId).toBe('1');
          expect(res.body.data.getDocumentsByUser[0].title).toBe(
            'Document de test',
          );
        });
    });

    it('should return document by id (API requise)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              getDocumentById(id: "1") {
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
          expect(res.body.data.getDocumentById.id).toBe('1');
          expect(res.body.data.getDocumentById.title).toBe('Document de test');
          expect(res.body.data.getDocumentById.userId).toBe('1');
        });
    });

    it('should create a new document (API requise)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createDocument(createDocumentInput: {
                title: "Nouveau document test"
                description: "Description du test"
                fileUrl: "https://example.com/test.pdf"
                userId: "1"
              }) {
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
          expect(res.body.data.createDocument.title).toBe(
            'Nouveau document test',
          );
          expect(res.body.data.createDocument.description).toBe(
            'Description du test',
          );
          expect(res.body.data.createDocument.fileUrl).toBe(
            'https://example.com/test.pdf',
          );
          expect(res.body.data.createDocument.userId).toBe('1');
          expect(res.body.data.createDocument.id).toBeDefined();
        });
    });

    it('should delete a document (API requise)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              deleteDocument(id: "2")
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.deleteDocument).toBe(true);
        });
    });

    it('should update a document', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              updateDocument(id: "1", updateDocumentInput: {
                title: "Titre modifié"
              }) {
                id
                title
                description
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.updateDocument.id).toBe('1');
          expect(res.body.data.updateDocument.title).toBe('Titre modifié');
        });
    });
  });

  // Test des enums
  describe('Enums', () => {
    it('should handle UserRole enum correctly', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createUser(createUserInput: {
                email: "admin2@example.com"
                username: "admin2"
                role: ADMIN
              }) {
                id
                email
                role
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createUser.role).toBe('ADMIN');
        });
    });
  });
});
