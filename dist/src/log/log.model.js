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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const graphql_1 = require("@nestjs/graphql");
const log_action_enum_1 = require("../common/enums/log-action.enum");
const entity_type_enum_1 = require("../common/enums/entity-type.enum");
let Log = class Log {
    id;
    action;
    entityType;
    entityId;
    userId;
    details;
    createdAt;
};
exports.Log = Log;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Log.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => log_action_enum_1.LogAction),
    __metadata("design:type", String)
], Log.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(() => entity_type_enum_1.EntityType),
    __metadata("design:type", String)
], Log.prototype, "entityType", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Log.prototype, "entityId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Log.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Log.prototype, "details", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Log.prototype, "createdAt", void 0);
exports.Log = Log = __decorate([
    (0, graphql_1.ObjectType)()
], Log);
//# sourceMappingURL=log.model.js.map