import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
export declare class DocumentEventsProcessor extends WorkerHost {
    process(job: Job<unknown>): Promise<void>;
}
