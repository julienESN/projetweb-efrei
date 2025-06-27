import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('document-events')
export class DocumentEventsProcessor extends WorkerHost {
  process(job: Job<unknown>): void {
    console.log('Event reçu dans la queue document-events:', job.data);
  }
}
