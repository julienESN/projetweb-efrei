import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { getQueueToken } from '@nestjs/bullmq';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: jest.Mocked<UserService>;

  const mockUsers = [
    {
      id: '1',
      email: 'admin@example.com',
      username: 'admin',
      role: UserRole.ADMIN,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      email: 'user@example.com',
      username: 'user',
      role: UserRole.USER,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const mockQueue = {
    add: jest.fn(),
  };

  // Mock d'utilisateurs pour les tests
  const mockAdminUser = {
    userId: '1',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const mockRegularUser = {
    userId: '2',
    email: 'user@example.com',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    const mockUserService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getQueueToken('user-events'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', () => {
      userService.findAll.mockReturnValue(mockUsers);

      const result = resolver.findAll();

      expect(result).toEqual(mockUsers);
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', () => {
      const userId = '1';
      userService.findById.mockReturnValue(mockUsers[0]);

      const result = resolver.findOne(userId);

      expect(result).toEqual(mockUsers[0]);
      expect(userService.findById).toHaveBeenCalledWith(userId);
    });

    it('should return undefined for non-existent user', () => {
      const userId = '999';
      userService.findById.mockReturnValue(undefined);

      const result = resolver.findOne(userId);

      expect(result).toBeUndefined();
      expect(userService.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const createUserInput: CreateUserInput = {
        email: 'newuser@example.com',
        username: 'newuser',
        role: UserRole.USER,
      };

      const expectedUser = {
        id: '3',
        ...createUserInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.create.mockReturnValue(expectedUser);

      const result = resolver.createUser(createUserInput);

      expect(result).toEqual(expectedUser);
      expect(userService.create).toHaveBeenCalledWith(createUserInput);
    });
  });

  describe('updateUser', () => {
    it('should update user when requested by admin', () => {
      const userId = '2';
      const updateUserInput: UpdateUserInput = {
        username: 'updated-username',
      };

      const expectedUser = {
        ...mockUsers[1],
        ...updateUserInput,
        updatedAt: new Date(),
      };

      userService.update.mockReturnValue(expectedUser);

      const result = resolver.updateUser(
        userId,
        updateUserInput,
        mockAdminUser,
      );

      expect(result).toEqual(expectedUser);
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserInput);
    });

    it('should allow user to update their own profile', () => {
      const userId = '2';
      const updateUserInput: UpdateUserInput = {
        username: 'self-updated',
      };

      const expectedUser = {
        ...mockUsers[1],
        ...updateUserInput,
        updatedAt: new Date(),
      };

      userService.update.mockReturnValue(expectedUser);

      const result = resolver.updateUser(
        userId,
        updateUserInput,
        mockRegularUser,
      );

      expect(result).toEqual(expectedUser);
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserInput);
    });

    it('should throw error when user tries to update other user profile', () => {
      const userId = '1'; // Admin's ID
      const updateUserInput: UpdateUserInput = {
        username: 'unauthorized-update',
      };

      expect(() => {
        resolver.updateUser(userId, updateUserInput, mockRegularUser);
      }).toThrow('Vous ne pouvez modifier que votre propre profil');
    });

    it('should return undefined for non-existent user', () => {
      const userId = '999';
      const updateUserInput: UpdateUserInput = {
        username: 'update-nonexistent',
      };

      userService.update.mockReturnValue(undefined);

      const result = resolver.updateUser(
        userId,
        updateUserInput,
        mockAdminUser,
      );

      expect(result).toBeUndefined();
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserInput);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', () => {
      const userId = '2';
      userService.delete.mockReturnValue(true);

      const result = resolver.deleteUser(userId);

      expect(result).toBe(true);
      expect(userService.delete).toHaveBeenCalledWith(userId);
    });
  });
});
