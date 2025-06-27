import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('user-events')
export class UserEventsProcessor extends WorkerHost {
  process(job: Job<unknown>): void {
    console.log('Event reçu dans la queue user-events:', job.data);
  }
}
