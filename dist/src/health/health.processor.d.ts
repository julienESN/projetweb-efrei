import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
export declare class HealthProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job<{
        checkedAt: string;
    }>): Promise<void>;
    onCompleted(job: Job): void;
}
