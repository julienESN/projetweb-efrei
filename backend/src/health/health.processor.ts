import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('health')
export class HealthProcessor extends WorkerHost {
  private readonly logger = new Logger(HealthProcessor.name);

  async process(job: Job<{ checkedAt: string }>): Promise<void> {
    this.logger.log(`Processing health job ${job.id} at ${job.data.checkedAt}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Health job ${job.id} completed`);
  }
}
