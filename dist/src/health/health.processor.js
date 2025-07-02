"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HealthProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthProcessor = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let HealthProcessor = HealthProcessor_1 = class HealthProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(HealthProcessor_1.name);
    async process(job) {
        this.logger.log(`Processing health job ${job.id} at ${job.data.checkedAt}`);
    }
    onCompleted(job) {
        this.logger.log(`Health job ${job.id} completed`);
    }
};
exports.HealthProcessor = HealthProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], HealthProcessor.prototype, "onCompleted", null);
exports.HealthProcessor = HealthProcessor = HealthProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('health')
], HealthProcessor);
//# sourceMappingURL=health.processor.js.map