import { Controller, Get } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('health')
export class HealthController {
  constructor(@InjectQueue('health') private readonly healthQueue: Queue) {}

  @Get()
  async getHealth(): Promise<string> {
    await this.healthQueue.add('health-check', {
      checkedAt: new Date().toISOString(),
    });
    return 'OK';
  }
}
