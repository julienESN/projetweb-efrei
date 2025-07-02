import { registerEnumType } from '@nestjs/graphql';

export enum EntityType {
  DOCUMENT = 'DOCUMENT',
  USER = 'USER',
}

registerEnumType(EntityType, {
  name: 'EntityType',
  description: "Les types d'entités du système",
});
