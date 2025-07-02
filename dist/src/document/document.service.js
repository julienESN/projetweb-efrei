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
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let DocumentService = class DocumentService {
    documentEventsQueue;
    constructor(documentEventsQueue) {
        this.documentEventsQueue = documentEventsQueue;
    }
    documents = [
        {
            id: '1',
            title: 'Document de test',
            description: 'Ceci est un document de test',
            fileUrl: 'https://example.com/file1.pdf',
            userId: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '2',
            title: 'Guide utilisateur',
            description: 'Guide pour les nouveaux utilisateurs',
            fileUrl: undefined,
            userId: '2',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    findAll() {
        return this.documents;
    }
    findById(id) {
        return this.documents.find((doc) => doc.id === id);
    }
    findByUserId(userId) {
        return this.documents.filter((doc) => doc.userId === userId);
    }
    create(documentData) {
        const newDocument = {
            id: (this.documents.length + 1).toString(),
            title: documentData.title,
            description: documentData.description,
            fileUrl: documentData.fileUrl || undefined,
            userId: documentData.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.documents.push(newDocument);
        void this.documentEventsQueue.add('document-event', {
            action: 'create',
            documentId: newDocument.id,
            timestamp: new Date(),
        });
        return newDocument;
    }
    update(id, documentData) {
        const docIndex = this.documents.findIndex((doc) => doc.id === id);
        if (docIndex === -1)
            return undefined;
        this.documents[docIndex] = {
            ...this.documents[docIndex],
            ...documentData,
            updatedAt: new Date(),
        };
        return this.documents[docIndex];
    }
    delete(id) {
        const docIndex = this.documents.findIndex((doc) => doc.id === id);
        if (docIndex === -1)
            return false;
        this.documents.splice(docIndex, 1);
        void this.documentEventsQueue.add('document-event', {
            action: 'delete',
            documentId: id,
            timestamp: new Date(),
        });
        return true;
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('document-events')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], DocumentService);
//# sourceMappingURL=document.service.js.map