import { Module } from '@nestjs/common';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { HealthController } from '../src/health/health.controller';
import { HealthProcessor } from '../src/health/health.processor';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Request, Response } from 'express';
import { PingResolver } from '../src/ping/ping.resolver';
import { TestAuthModule } from './test-auth.module';
import { DocumentService } from '../src/document/document.service';
import { TestDocumentService } from './test-document.service';
import { DocumentResolver } from '../src/document/document.resolver';
import { DocumentEventsProcessor } from '../src/document/document-events.processor';
import { PrismaModule } from '../src/prisma/prisma.module';
import { getQueueToken } from '@nestjs/bullmq';
import { TestDatabaseService } from './test-database.service';

// Mocks pour les queues BullMQ
const mockQueue = {
  add: jest.fn().mockResolvedValue({}),
  process: jest.fn(),
  close: jest.fn(),
};

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      playground: true,
      introspection: true,
      csrfPrevention: false,
    }),
    PrismaModule,
    TestAuthModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    HealthProcessor,
    PingResolver,
    {
      provide: DocumentService,
      useClass: TestDocumentService,
    },
    DocumentResolver,
    DocumentEventsProcessor,
    TestDatabaseService,
    // Mocks pour les queues BullMQ
    {
      provide: getQueueToken('health'),
      useValue: mockQueue,
    },
    {
      provide: getQueueToken('document-events'),
      useValue: mockQueue,
    },
  ],
})
export class TestAppModule {}
