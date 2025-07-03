import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getQueueToken } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';

describe('AuthService Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;

  // Mock pour la queue BullMQ utilisée par UserService
  const mockUserEventsQueue = {
    add: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        PrismaModule,
      ],
      providers: [
        // Services Auth
        AuthService,
        AuthResolver,
        LocalStrategy,
        JwtStrategy,
        // UserService avec sa queue mockée
        UserService,
        {
          provide: getQueueToken('user-events'),
          useValue: mockUserEventsQueue,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('🔐 Authentification', () => {
    it('devrait valider un utilisateur avec des identifiants corrects', async () => {
      const result = await authService.validateUser(
        'admin@example.com',
        'password',
      );
      expect(result).toBeDefined();
      expect(result?.email).toBe('admin@example.com');
      expect(result?.role).toBe('ADMIN');
    });

    it('devrait retourner null pour des identifiants incorrects', async () => {
      const result = await authService.validateUser(
        'admin@example.com',
        'mauvais-mot-de-passe',
      );
      expect(result).toBeNull();
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const loginInput = {
        email: 'admin@example.com',
        password: 'password',
      };

      const result = await authService.login(loginInput);

      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('admin@example.com');
      expect(result.user.role).toBe('ADMIN');
      expect(typeof result.access_token).toBe('string');
    });

    it('devrait échouer la connexion avec des identifiants invalides', async () => {
      const loginInput = {
        email: 'admin@example.com',
        password: 'mauvais-mot-de-passe',
      };

      await expect(authService.login(loginInput)).rejects.toThrow(
        'Identifiants invalides',
      );
    });
  });

  describe('📝 Inscription', () => {
    it('devrait inscrire un nouvel utilisateur', async () => {
      const registerInput = {
        email: `test-${Date.now()}@example.com`,
        username: `testuser-${Date.now()}`,
        password: 'motdepasse123',
        role: 'USER' as any,
      };

      const result = await authService.register(registerInput);

      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(registerInput.email);
      expect(result.user.username).toBe(registerInput.username);
      expect(result.user.role).toBe('USER');
      expect(typeof result.access_token).toBe('string');
    });

    it("devrait échouer l'inscription avec un email existant", async () => {
      const registerInput = {
        email: 'admin@example.com', // Email qui existe déjà
        username: 'nouveau-admin',
        password: 'motdepasse123',
        role: 'USER' as any,
      };

      await expect(authService.register(registerInput)).rejects.toThrow(
        'Cet email est déjà utilisé',
      );
    });

    it("devrait hasher le mot de passe lors de l'inscription", async () => {
      const registerInput = {
        email: `test-hash-${Date.now()}@example.com`,
        username: `testhash-${Date.now()}`,
        password: 'motdepasse123',
        role: 'USER' as any,
      };

      await authService.register(registerInput);

      // Vérifier que l'utilisateur peut se connecter avec son mot de passe
      const loginResult = await authService.login({
        email: registerInput.email,
        password: registerInput.password,
      });

      expect(loginResult).toBeDefined();
      expect(loginResult.user.email).toBe(registerInput.email);
    });
  });

  describe('🛡️ Sécurité', () => {
    it('ne devrait jamais exposer le mot de passe dans les réponses', async () => {
      const registerInput = {
        email: `test-security-${Date.now()}@example.com`,
        username: `testsec-${Date.now()}`,
        password: 'motdepasse123',
        role: 'USER' as any,
      };

      const result = await authService.register(registerInput);

      // Vérifier que le mot de passe n'est pas dans la réponse
      expect(result.user).not.toHaveProperty('password');
      expect(JSON.stringify(result)).not.toContain('motdepasse123');
    });

    it('devrait générer des tokens JWT différents à chaque connexion', async () => {
      const loginInput = {
        email: 'admin@example.com',
        password: 'password',
      };

      const result1 = await authService.login(loginInput);
      // Délai de 1 seconde pour s'assurer que les timestamps JWT sont différents
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result2 = await authService.login(loginInput);

      expect(result1.access_token).not.toBe(result2.access_token);
    });
  });
});
