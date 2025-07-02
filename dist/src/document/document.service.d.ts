import { Document } from './document.model';
import { Queue } from 'bullmq';
export declare class DocumentService {
    private documentEventsQueue;
    constructor(documentEventsQueue: Queue);
    private documents;
    findAll(): Document[];
    findById(id: string): Document | undefined;
    findByUserId(userId: string): Document[];
    create(documentData: Partial<Document>): Document;
    update(id: string, documentData: Partial<Document>): Document | undefined;
    delete(id: string): boolean;
}
