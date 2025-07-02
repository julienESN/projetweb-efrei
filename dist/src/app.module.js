"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const health_controller_1 = require("./health/health.controller");
const bullmq_1 = require("@nestjs/bullmq");
const health_processor_1 = require("./health/health.processor");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const path_1 = require("path");
const ping_resolver_1 = require("./ping/ping.resolver");
const user_service_1 = require("./user/user.service");
const user_resolver_1 = require("./user/user.resolver");
const user_events_processor_1 = require("./user/user-events.processor");
const document_service_1 = require("./document/document.service");
const document_resolver_1 = require("./document/document.resolver");
const document_events_processor_1 = require("./document/document-events.processor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
            }),
            bullmq_1.BullModule.forRoot({
                connection: process.env.REDIS_URL ?
                    {
                        host: new URL(process.env.REDIS_URL).hostname,
                        port: parseInt(new URL(process.env.REDIS_URL).port) || 6379,
                        username: new URL(process.env.REDIS_URL).username || undefined,
                        password: new URL(process.env.REDIS_URL).password || undefined,
                    } :
                    {
                        host: process.env.REDIS_HOST || 'localhost',
                        port: parseInt(process.env.REDIS_PORT || '6379'),
                    },
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'health',
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'document-events',
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'user-events',
            }),
        ],
        controllers: [app_controller_1.AppController, health_controller_1.HealthController],
        providers: [
            app_service_1.AppService,
            health_processor_1.HealthProcessor,
            ping_resolver_1.PingResolver,
            user_service_1.UserService,
            user_resolver_1.UserResolver,
            user_events_processor_1.UserEventsProcessor,
            document_service_1.DocumentService,
            document_resolver_1.DocumentResolver,
            document_events_processor_1.DocumentEventsProcessor,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map