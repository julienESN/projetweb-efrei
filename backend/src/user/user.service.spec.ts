import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserRole } from '../common/enums/user-role.enum';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let mockQueue: jest.Mocked<Queue>;
  let prismaService: PrismaService;

  const mockUsers = [
    { id: '1', email: 'admin@example.com', username: 'admin', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', email: 'user@example.com', username: 'user', role: 'USER', createdAt: new Date(), updatedAt: new Date() },
  ];

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $disconnect: jest.fn(),
          },
        },
        {
          provide: getQueueToken('user-events'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers as any);

      const users = await service.findAll();
      expect(users).toHaveLength(2);
      expect(users[0]).toHaveProperty('email', 'admin@example.com');
      expect(users[1]).toHaveProperty('email', 'user@example.com');
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUsers[0] as any);

      const user = await service.findById('1');
      expect(user).toBeDefined();
      expect(user?.email).toBe('admin@example.com');
      expect(user?.role).toBe(UserRole.ADMIN);
    });

    it('should return null for non-existent user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const user = await service.findById('999');
      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUsers[0] as any);

      const user = await service.findByEmail('admin@example.com');
      expect(user).toBeDefined();
      expect(user?.id).toBe('1');
      expect(user?.username).toBe('admin');
    });

    it('should return null for non-existent email', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const user = await service.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        role: UserRole.USER,
      };

      const mockCreatedUser = {
        id: '3',
        ...userData,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockCreatedUser as any);

      const newUser = await service.create(userData);

      expect(newUser).toBeDefined();
      expect(newUser.id).toBe('3');
      expect(newUser.email).toBe(userData.email);
      expect(newUser.username).toBe(userData.username);
      expect(newUser.role).toBe(userData.role);
      expect(newUser.createdAt).toBeInstanceOf(Date);
      expect(newUser.updatedAt).toBeInstanceOf(Date);

      // Vérifier que l'événement a été ajouté à la queue
      expect(mockQueue.add).toHaveBeenCalledWith('user-event', {
        action: 'create',
        userId: '3',
        timestamp: expect.any(Date),
      });
    });

    it('should create a user with default role USER', async () => {
      const userData = {
        email: 'defaultuser@example.com',
        username: 'defaultuser',
      };

      const mockCreatedUser = {
        id: '4',
        ...userData,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockCreatedUser as any);

      const newUser = await service.create(userData);

      expect(newUser.role).toBe(UserRole.USER);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateData = {
        username: 'updated-admin',
        email: 'updated-admin@example.com',
      };

      const mockUpdatedUser = {
        id: '1',
        username: 'updated-admin',
        email: 'updated-admin@example.com',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUpdatedUser as any);

      const updatedUser = await service.update('1', updateData);

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.id).toBe('1');
      expect(updatedUser?.username).toBe(updateData.username);
      expect(updatedUser?.email).toBe(updateData.email);
      expect(updatedUser?.role).toBe(UserRole.ADMIN);
      expect(updatedUser?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent user', async () => {
      const updateData = { username: 'updated' };
      jest.spyOn(prismaService.user, 'update').mockRejectedValue(new Error('Record not found'));

      const result = await service.update('999', updateData);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing user', async () => {
      jest.spyOn(prismaService.user, 'delete').mockResolvedValue({} as any);

      const result = await service.delete('2');

      expect(result).toBe(true);

      // Vérifier que l'événement a été ajouté à la queue
      expect(mockQueue.add).toHaveBeenCalledWith('user-event', {
        action: 'delete',
        userId: '2',
        timestamp: expect.any(Date),
      });
    });

    it('should return false for non-existent user', async () => {
      jest.spyOn(prismaService.user, 'delete').mockRejectedValue(new Error('Record not found'));

      const result = await service.delete('999');

      expect(result).toBe(false);
    });
  });
});
