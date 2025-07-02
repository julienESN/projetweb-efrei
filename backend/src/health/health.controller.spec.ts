import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: 'BullQueue_health',
          useValue: mockQueue,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return OK', async () => {
    const result = await controller.getHealth();
    expect(result).toBe('OK');
    expect(mockQueue.add).toHaveBeenCalledWith('health-check', {
      checkedAt: expect.any(String) as string,
    });
  });
});
