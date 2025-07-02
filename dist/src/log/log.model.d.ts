import { LogAction } from '../common/enums/log-action.enum';
import { EntityType } from '../common/enums/entity-type.enum';
export declare class Log {
    id: string;
    action: LogAction;
    entityType: EntityType;
    entityId: string;
    userId: string;
    details?: string;
    createdAt: Date;
}
