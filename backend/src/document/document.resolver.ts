import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Document } from './document.model';
import { DocumentService } from './document.service';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';

@Resolver(() => Document)
export class DocumentResolver {
  constructor(private readonly documentService: DocumentService) {}

  @Query(() => [Document], { name: 'documents' })
  findAll(): Document[] {
    return this.documentService.findAll();
  }

  @Query(() => [Document], { name: 'getDocumentsByUser' })
  getDocumentsByUser(@Args('userId') userId: string): Document[] {
    return this.documentService.findByUserId(userId);
  }

  @Query(() => Document, { name: 'getDocumentById', nullable: true })
  getDocumentById(@Args('id') id: string): Document | undefined {
    return this.documentService.findById(id);
  }

  @Mutation(() => Document)
  createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
  ): Document {
    return this.documentService.create(createDocumentInput);
  }

  @Mutation(() => Document, { nullable: true })
  updateDocument(
    @Args('id') id: string,
    @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
  ): Document | undefined {
    return this.documentService.update(id, updateDocumentInput);
  }

  @Mutation(() => Boolean)
  deleteDocument(@Args('id') id: string): boolean {
    return this.documentService.delete(id);
  }
}
