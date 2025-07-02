import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserRole } from '../common/enums/user-role.enum';

describe('UserService', () => {
  let service: UserService;
  let mockQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getQueueToken('user-events'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', () => {
      const users = service.findAll();
      expect(users).toHaveLength(2);
      expect(users[0]).toHaveProperty('email', 'admin@example.com');
      expect(users[1]).toHaveProperty('email', 'user@example.com');
    });
  });

  describe('findById', () => {
    it('should return a user by id', () => {
      const user = service.findById('1');
      expect(user).toBeDefined();
      expect(user?.email).toBe('admin@example.com');
      expect(user?.role).toBe(UserRole.ADMIN);
    });

    it('should return undefined for non-existent user', () => {
      const user = service.findById('999');
      expect(user).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', () => {
      const user = service.findByEmail('admin@example.com');
      expect(user).toBeDefined();
      expect(user?.id).toBe('1');
      expect(user?.username).toBe('admin');
    });

    it('should return undefined for non-existent email', () => {
      const user = service.findByEmail('nonexistent@example.com');
      expect(user).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new user', () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        role: UserRole.USER,
      };

      const newUser = service.create(userData);

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

    it('should create a user with default role USER', () => {
      const userData = {
        email: 'defaultuser@example.com',
        username: 'defaultuser',
      };

      const newUser = service.create(userData);

      expect(newUser.role).toBe(UserRole.USER);
    });

    it('should add the new user to the list', () => {
      const initialCount = service.findAll().length;

      service.create({
        email: 'test@example.com',
        username: 'test',
      });

      expect(service.findAll().length).toBe(initialCount + 1);
    });
  });

  describe('update', () => {
    it('should update an existing user', () => {
      const updateData = {
        username: 'updated-admin',
        email: 'updated-admin@example.com',
      };

      const updatedUser = service.update('1', updateData);

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.id).toBe('1');
      expect(updatedUser?.username).toBe(updateData.username);
      expect(updatedUser?.email).toBe(updateData.email);
      expect(updatedUser?.role).toBe(UserRole.ADMIN); // Role should remain unchanged
      expect(updatedUser?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return undefined for non-existent user', () => {
      const updateData = { username: 'updated' };
      const result = service.update('999', updateData);

      expect(result).toBeUndefined();
    });

    it('should preserve existing data when partially updating', () => {
      const originalUser = service.findById('1');
      const updateData = { username: 'new-username' };

      const updatedUser = service.update('1', updateData);

      expect(updatedUser?.email).toBe(originalUser?.email);
      expect(updatedUser?.role).toBe(originalUser?.role);
      expect(updatedUser?.username).toBe(updateData.username);
    });
  });

  describe('delete', () => {
    it('should delete an existing user', () => {
      const initialCount = service.findAll().length;
      const result = service.delete('2');

      expect(result).toBe(true);
      expect(service.findAll().length).toBe(initialCount - 1);
      expect(service.findById('2')).toBeUndefined();

      // Vérifier que l'événement a été ajouté à la queue
      expect(mockQueue.add).toHaveBeenCalledWith('user-event', {
        action: 'delete',
        userId: '2',
        timestamp: expect.any(Date),
      });
    });

    it('should return false for non-existent user', () => {
      const initialCount = service.findAll().length;
      const result = service.delete('999');

      expect(result).toBe(false);
      expect(service.findAll().length).toBe(initialCount);
    });
  });
});
