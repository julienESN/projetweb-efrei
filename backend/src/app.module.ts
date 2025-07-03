import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { BullModule } from '@nestjs/bullmq';
import { HealthProcessor } from './health/health.processor';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Request, Response } from 'express';
import { PingResolver } from './ping/ping.resolver';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DocumentService } from './document/document.service';
import { DocumentResolver } from './document/document.resolver';
import { DocumentEventsProcessor } from './document/document-events.processor';
import { PrismaModule } from './prisma/prisma.module';

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
      csrfPrevention: false, // Désactiver CSRF pour le développement
    }),
    BullModule.forRoot({
      connection: process.env.REDIS_URL
        ? // Configuration avec URL Redis complète (pour services externes)
          {
            host: new URL(process.env.REDIS_URL).hostname,
            port: parseInt(new URL(process.env.REDIS_URL).port) || 6379,
            username: new URL(process.env.REDIS_URL).username || undefined,
            password: new URL(process.env.REDIS_URL).password || undefined,
          }
        : // Configuration avec paramètres individuels (pour Redis intégré ou Docker Compose)
          {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
    }),
    BullModule.registerQueue({
      name: 'health',
    }),
    BullModule.registerQueue({
      name: 'document-events',
    }),
    BullModule.registerQueue({
      name: 'user-events',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    HealthProcessor,
    PingResolver,
    DocumentService,
    DocumentResolver,
    DocumentEventsProcessor,
  ],
})
export class AppModule {}
