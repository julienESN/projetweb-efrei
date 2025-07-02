import { Queue } from 'bullmq';
export declare class HealthController {
    private readonly healthQueue;
    constructor(healthQueue: Queue);
    getHealth(): Promise<string>;
}
