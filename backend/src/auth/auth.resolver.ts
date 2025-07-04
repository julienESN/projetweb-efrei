import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthResponse } from './dto/auth-response';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../user/user.model';

/**
 * Resolver GraphQL pour la gestion de l'authentification.
 * Gère les opérations de connexion, inscription et récupération du profil utilisateur.
 */
@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  /**
   * Authentifie un utilisateur avec ses identifiants.
   * @param loginInput - Les données de connexion (email et mot de passe)
   * @returns Réponse d'authentification contenant le token JWT et les informations utilisateur
   */
  @Mutation(() => AuthResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  /**
   * Inscrit un nouvel utilisateur dans le système.
   * @param registerInput - Les données d'inscription (nom, email, mot de passe)
   * @returns Réponse d'authentification contenant le token JWT et les informations utilisateur
   */
  @Mutation(() => AuthResponse)
  async register(
    @Args('registerInput') registerInput: RegisterInput,
  ): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  /**
   * Récupère les informations complètes de l'utilisateur authentifié.
   * Nécessite une authentification valide (token JWT).
   * @param user - Les données de l'utilisateur extrait du token JWT
   * @returns Les informations complètes de l'utilisateur connecté
   */
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(
    @CurrentUser() user: { userId: string; email: string; role: string },
  ): Promise<User> {
    // Récupérer les données complètes de l'utilisateur
    const fullUser = await this.userService.findById(user.userId);
    if (!fullUser) {
      throw new Error('Utilisateur non trouvé');
    }

    return fullUser;
  }
}
