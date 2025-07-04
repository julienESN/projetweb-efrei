import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './user.model';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

/**
 * Resolver GraphQL pour la gestion des utilisateurs.
 * Gère les opérations CRUD sur les utilisateurs avec contrôle d'accès basé sur les rôles.
 */
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * Récupère la liste de tous les utilisateurs du système.
   * Accessible uniquement aux administrateurs.
   * @returns Liste complète de tous les utilisateurs
   */
  @Query(() => [User], { name: 'users' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  /**
   * Récupère un utilisateur spécifique par son identifiant.
   * @param id - L'identifiant unique de l'utilisateur
   * @returns L'utilisateur correspondant ou null s'il n'existe pas
   */
  @Query(() => User, { name: 'user', nullable: true })
  async findOne(@Args('id') id: string): Promise<User | null> {
    return this.userService.findById(id);
  }

  /**
   * Crée un nouvel utilisateur dans le système.
   * Accessible uniquement aux administrateurs.
   * @param createUserInput - Les données de l'utilisateur à créer
   * @returns L'utilisateur créé
   */
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.userService.create(createUserInput);
  }

  /**
   * Met à jour les informations d'un utilisateur existant.
   * Un utilisateur ne peut modifier que son propre profil, sauf s'il est administrateur.
   * @param id - L'identifiant de l'utilisateur à modifier
   * @param updateUserInput - Les nouvelles données de l'utilisateur
   * @param currentUser - L'utilisateur authentifié effectuant la modification
   * @returns L'utilisateur modifié ou null s'il n'existe pas
   */
  @Mutation(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id') id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser()
    currentUser: { userId: string; email: string; role: UserRole },
  ): Promise<User | null> {
    // Un utilisateur ne peut modifier que son propre profil, sauf s'il est admin
    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== id) {
      throw new Error('Vous ne pouvez modifier que votre propre profil');
    }
    return this.userService.update(id, updateUserInput);
  }

  /**
   * Supprime un utilisateur du système.
   * Accessible uniquement aux administrateurs.
   * @param id - L'identifiant de l'utilisateur à supprimer
   * @returns true si la suppression a réussi, false sinon
   */
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    return this.userService.delete(id);
  }
}
