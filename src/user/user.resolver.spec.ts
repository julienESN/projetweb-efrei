import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
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

    it('should return empty array when no users exist', () => {
      userService.findAll.mockReturnValue([]);

      const result = resolver.findAll();

      expect(result).toEqual([]);
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

    it('should create a user with minimal data', () => {
      const createUserInput: CreateUserInput = {
        email: 'minimal@example.com',
        username: 'minimal',
        role: UserRole.USER,
      };

      const expectedUser = {
        id: '3',
        ...createUserInput,
        role: UserRole.USER,
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
    it('should update an existing user', () => {
      const userId = '1';
      const updateUserInput: UpdateUserInput = {
        username: 'updated-admin',
        email: 'updated-admin@example.com',
      };

      const expectedUser = {
        ...mockUsers[0],
        ...updateUserInput,
        updatedAt: new Date(),
      };

      userService.update.mockReturnValue(expectedUser);

      const result = resolver.updateUser(userId, updateUserInput);

      expect(result).toEqual(expectedUser);
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserInput);
    });

    it('should return undefined for non-existent user', () => {
      const userId = '999';
      const updateUserInput: UpdateUserInput = {
        username: 'nonexistent',
      };

      userService.update.mockReturnValue(undefined);

      const result = resolver.updateUser(userId, updateUserInput);

      expect(result).toBeUndefined();
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserInput);
    });

    it('should handle partial updates', () => {
      const userId = '1';
      const updateUserInput: UpdateUserInput = {
        username: 'new-username-only',
      };

      const expectedUser = {
        ...mockUsers[0],
        username: 'new-username-only',
        updatedAt: new Date(),
      };

      userService.update.mockReturnValue(expectedUser);

      const result = resolver.updateUser(userId, updateUserInput);

      expect(result).toEqual(expectedUser);
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserInput);
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', () => {
      const userId = '2';
      userService.delete.mockReturnValue(true);

      const result = resolver.deleteUser(userId);

      expect(result).toBe(true);
      expect(userService.delete).toHaveBeenCalledWith(userId);
    });

    it('should return false for non-existent user', () => {
      const userId = '999';
      userService.delete.mockReturnValue(false);

      const result = resolver.deleteUser(userId);

      expect(result).toBe(false);
      expect(userService.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('integration behavior', () => {
    it('should handle service errors gracefully', () => {
      const userId = '1';
      userService.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      expect(() => resolver.findOne(userId)).toThrow('Database error');
    });

    it('should pass through service return values correctly', () => {
      const createInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'test',
        role: UserRole.USER,
      };

      const serviceResult = {
        id: '100',
        email: 'test@example.com',
        username: 'test',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.create.mockReturnValue(serviceResult);

      const resolverResult = resolver.createUser(createInput);

      expect(resolverResult).toBe(serviceResult);
      expect(resolverResult).toHaveProperty('id', '100');
    });
  });
});
