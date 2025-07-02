import { ObjectType, Field, ID } from '@nestjs/graphql';
import { LogAction } from '../common/enums/log-action.enum';
import { EntityType } from '../common/enums/entity-type.enum';

@ObjectType()
export class Log {
  @Field(() => ID)
  id: string;

  @Field(() => LogAction)
  action: LogAction;

  @Field(() => EntityType)
  entityType: EntityType;

  @Field()
  entityId: string; // ID de l'entité concernée

  @Field()
  userId: string; // ID de l'utilisateur qui a effectué l'action

  @Field({ nullable: true })
  details?: string; // Détails supplémentaires en JSON

  @Field()
  createdAt: Date;
}
