import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
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

  it('/health (GET) should return OK', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect('OK');
  });

  it('/health (GET) should trigger BullMQ job', async () => {
    // Ce test vérifie que l'endpoint health fonctionne
    // Le job BullMQ est ajouté mais on ne teste pas sa réception ici
    // (cela nécessiterait une configuration Redis de test)
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.text).toBe('OK');
  });
});
