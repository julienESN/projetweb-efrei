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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const document_model_1 = require("./document.model");
const document_service_1 = require("./document.service");
const create_document_input_1 = require("./dto/create-document.input");
const update_document_input_1 = require("./dto/update-document.input");
let DocumentResolver = class DocumentResolver {
    documentService;
    constructor(documentService) {
        this.documentService = documentService;
    }
    findAll() {
        return this.documentService.findAll();
    }
    getDocumentsByUser(userId) {
        return this.documentService.findByUserId(userId);
    }
    getDocumentById(id) {
        return this.documentService.findById(id);
    }
    createDocument(createDocumentInput) {
        return this.documentService.create(createDocumentInput);
    }
    updateDocument(id, updateDocumentInput) {
        return this.documentService.update(id, updateDocumentInput);
    }
    deleteDocument(id) {
        return this.documentService.delete(id);
    }
};
exports.DocumentResolver = DocumentResolver;
__decorate([
    (0, graphql_1.Query)(() => [document_model_1.Document], { name: 'documents' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], DocumentResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => [document_model_1.Document], { name: 'getDocumentsByUser' }),
    __param(0, (0, graphql_1.Args)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], DocumentResolver.prototype, "getDocumentsByUser", null);
__decorate([
    (0, graphql_1.Query)(() => document_model_1.Document, { name: 'getDocumentById', nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], DocumentResolver.prototype, "getDocumentById", null);
__decorate([
    (0, graphql_1.Mutation)(() => document_model_1.Document),
    __param(0, (0, graphql_1.Args)('createDocumentInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_document_input_1.CreateDocumentInput]),
    __metadata("design:returntype", document_model_1.Document)
], DocumentResolver.prototype, "createDocument", null);
__decorate([
    (0, graphql_1.Mutation)(() => document_model_1.Document, { nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('updateDocumentInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_document_input_1.UpdateDocumentInput]),
    __metadata("design:returntype", Object)
], DocumentResolver.prototype, "updateDocument", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], DocumentResolver.prototype, "deleteDocument", null);
exports.DocumentResolver = DocumentResolver = __decorate([
    (0, graphql_1.Resolver)(() => document_model_1.Document),
    __metadata("design:paramtypes", [document_service_1.DocumentService])
], DocumentResolver);
//# sourceMappingURL=document.resolver.js.map