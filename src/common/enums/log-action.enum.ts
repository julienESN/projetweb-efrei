import { registerEnumType } from '@nestjs/graphql';

export enum LogAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
}

registerEnumType(LogAction, {
  name: 'LogAction',
  description: 'Les actions possibles à enregistrer dans les logs',
});
