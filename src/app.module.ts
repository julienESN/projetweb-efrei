import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { BullModule } from '@nestjs/bullmq';
import { HealthProcessor } from './health/health.processor';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PingResolver } from './ping/ping.resolver';
import { UserService } from './user/user.service';
import { UserResolver } from './user/user.resolver';
import { UserEventsProcessor } from './user/user-events.processor';
import { DocumentService } from './document/document.service';
import { DocumentResolver } from './document/document.resolver';
import { DocumentEventsProcessor } from './document/document-events.processor';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    BullModule.forRoot({
      connection: process.env.REDIS_URL ? 
        // Configuration avec URL Redis complète (pour services externes)
        {
          host: new URL(process.env.REDIS_URL).hostname,
          port: parseInt(new URL(process.env.REDIS_URL).port) || 6379,
          username: new URL(process.env.REDIS_URL).username || undefined,
          password: new URL(process.env.REDIS_URL).password || undefined,
        } :
        // Configuration avec paramètres individuels (pour Redis intégré ou Docker Compose)
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
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    HealthProcessor,
    PingResolver,
    UserService,
    UserResolver,
    UserEventsProcessor,
    DocumentService,
    DocumentResolver,
    DocumentEventsProcessor,
  ],
})
export class AppModule {}
