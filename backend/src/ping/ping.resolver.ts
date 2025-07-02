import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class PingResolver {
  @Query(() => String, { name: 'result' })
  ping(): string {
    return 'ok';
  }
}
