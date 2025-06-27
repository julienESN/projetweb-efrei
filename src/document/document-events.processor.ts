import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('document-events')
export class DocumentEventsProcessor extends WorkerHost {
  async process(job: Job<unknown>): Promise<void> {
    console.log('Event reçu dans la queue document-events:', job.data);
  }
}
