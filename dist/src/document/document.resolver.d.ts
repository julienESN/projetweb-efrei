import { Document } from './document.model';
import { DocumentService } from './document.service';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
export declare class DocumentResolver {
    private readonly documentService;
    constructor(documentService: DocumentService);
    findAll(): Document[];
    getDocumentsByUser(userId: string): Document[];
    getDocumentById(id: string): Document | undefined;
    createDocument(createDocumentInput: CreateDocumentInput): Document;
    updateDocument(id: string, updateDocumentInput: UpdateDocumentInput): Document | undefined;
    deleteDocument(id: string): boolean;
}
