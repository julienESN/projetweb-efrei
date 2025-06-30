import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Document } from './document.model';
import { DocumentService } from './document.service';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Resolver(() => Document)
export class DocumentResolver {
  constructor(private readonly documentService: DocumentService) {}

  @Query(() => [Document], { name: 'documents' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(): Document[] {
    return this.documentService.findAll();
  }

  @Query(() => [Document], { name: 'getDocumentsByUser' })
  @UseGuards(GqlAuthGuard)
  getDocumentsByUser(
    @Args('userId') userId: string,
    @CurrentUser()
    currentUser: { userId: string; email: string; role: UserRole },
  ): Document[] {
    // Un utilisateur ne peut voir que ses propres documents, sauf s'il est admin
    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== userId) {
      throw new Error('Vous ne pouvez voir que vos propres documents');
    }
    return this.documentService.findByUserId(userId);
  }

  @Query(() => Document, { name: 'getDocumentById', nullable: true })
  @UseGuards(GqlAuthGuard)
  getDocumentById(@Args('id') id: string): Document | undefined {
    return this.documentService.findById(id);
  }

  @Mutation(() => Document)
  @UseGuards(GqlAuthGuard)
  createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
    @CurrentUser()
    currentUser: { userId: string; email: string; role: UserRole },
  ): Document {
    // Ajouter l'ID de l'utilisateur actuel au document
    const documentWithUser = {
      ...createDocumentInput,
      userId: currentUser.userId,
    };
    return this.documentService.create(documentWithUser);
  }

  @Mutation(() => Document, { nullable: true })
  @UseGuards(GqlAuthGuard)
  updateDocument(
    @Args('id') id: string,
    @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
    @CurrentUser()
    currentUser: { userId: string; email: string; role: UserRole },
  ): Document | undefined {
    // Vérifier que l'utilisateur peut modifier ce document
    const document = this.documentService.findById(id);
    if (!document) {
      throw new Error('Document non trouvé');
    }

    if (
      currentUser.role !== UserRole.ADMIN &&
      document.userId !== currentUser.userId
    ) {
      throw new Error('Vous ne pouvez modifier que vos propres documents');
    }

    return this.documentService.update(id, updateDocumentInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  deleteDocument(
    @Args('id') id: string,
    @CurrentUser()
    currentUser: { userId: string; email: string; role: UserRole },
  ): boolean {
    // Vérifier que l'utilisateur peut supprimer ce document
    const document = this.documentService.findById(id);
    if (!document) {
      throw new Error('Document non trouvé');
    }

    if (
      currentUser.role !== UserRole.ADMIN &&
      document.userId !== currentUser.userId
    ) {
      throw new Error('Vous ne pouvez supprimer que vos propres documents');
    }

    return this.documentService.delete(id);
  }
}
