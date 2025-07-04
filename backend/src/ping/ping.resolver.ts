import { Query, Resolver } from '@nestjs/graphql';

/**
 * Resolver GraphQL pour les vérifications de connectivité.
 * Fournit un endpoint simple pour tester la disponibilité de l'API GraphQL.
 */
@Resolver()
export class PingResolver {
  /**
   * Endpoint de test pour vérifier la connectivité de l'API.
   * Retourne un simple message de confirmation pour valider que le serveur répond.
   * @returns Message de confirmation "ok"
   */
  @Query(() => String, { name: 'result' })
  ping(): string {
    return 'ok';
  }
}
