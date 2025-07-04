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

/**
 * Resolver GraphQL pour la gestion des documents.
 * Gère les opérations CRUD sur les documents avec contrôle d'accès basé sur les rôles.
 */
@Resolver(() => Document)
export class DocumentResolver {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Récupère tous les documents du système.
   * Accessible uniquement aux administrateurs.
   * @returns Liste complète de tous les documents
   */
  @Query(() => [Document], { name: 'documents' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<Document[]> {
    return this.documentService.findAll();
  }

  /**
   * Récupère les documents d'un utilisateur spécifique.
   * Un utilisateur ne peut voir que ses propres documents, sauf s'il est administrateur.
   * @param userId - L'identifiant de l'utilisateur dont on veut récupérer les documents
   * @param currentUser - L'utilisateur authentifié effectuant la requête
   * @returns Liste des documents de l'utilisateur spécifié
   */
  @Query(() => [Document], { name: 'getDocumentsByUser' })
  @UseGuards(GqlAuthGuard)
  async getDocumentsByUser(
    @Args('userId') userId: string,
    @CurrentUser()
    currentUser: { userId: string; email: string; role: UserRole },
  ): Promise<Document[]> {
    // Un utilisateur ne peut voir que ses propres documents, sauf s'il est admin
    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== userId) {
      throw new Error('Vous ne pouvez voir que vos propres documents');
    }
    return this.documentService.findByUserId(userId);
  }

  /**
   * Récupère un document spécifique par son identifiant.
   * @param id - L'identifiant unique du document
   * @returns Le document correspondant ou null s'il n'existe pas
   */
  @Query(() => Document, { name: 'getDocumentById', nullable: true })
  async getDocumentById(@Args('id') id: string): Promise<Document | null> {
    return this.documentService.findById(id);
  }

  /**
   * Crée un nouveau document.
   * Le document est automatiquement associé à l'utilisateur authentifié.
   * @param createDocumentInput - Les données du document à créer
   * @param currentUser - L'utilisateur authentifié créant le document
   * @returns Le document créé
   */
  @Mutation(() => Document)
  @UseGuards(GqlAuthGuard)
  async createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
    @CurrentUser()
    currentUser: { userId: string; email: string; role: UserRole },
  ): Promise<Document> {
    // Ajouter l'ID de l'utilisateur actuel au document
    const documentWithUser = {
      ...createDocumentInput,
      userId: currentUser.userId,
    };
    return this.documentService.create(documentWithUser);
  }

  /**
   * Met à jour un document existant.
   * Un utilisateur ne peut modifier que ses propres documents, sauf s'il est administrateur.
   * @param id - L'identifiant du document à modifier
   * @param updateDocumentInput - Les nouvelles données du document
   * @param currentUser - L'utilisateur authentifié effectuant la modification
   * @returns Le document modifié ou null s'il n'existe pas
   */
  @Mutation(() => Document, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async updateDocument(
    @Args('id') id: string,
    @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
    @CurrentUser()
    currentUser: { userId: string; email: string; role: UserRole },
  ): Promise<Document | null> {
    // Vérifier que l'utilisateur peut modifier ce document
    const document = await this.documentService.findById(id);
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

  /**
   * Supprime un document existant.
   * Un utilisateur ne peut supprimer que ses propres documents, sauf s'il est administrateur.
   * @param id - L'identifiant du document à supprimer
   * @param currentUser - L'utilisateur authentifié effectuant la suppression
   * @returns true si la suppression a réussi, false sinon
   */
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteDocument(
    @Args('id') id: string,
    @CurrentUser()
    currentUser: { userId: string; email: string; role: UserRole },
  ): Promise<boolean> {
    // Vérifier que l'utilisateur peut supprimer ce document
    const document = await this.documentService.findById(id);
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
