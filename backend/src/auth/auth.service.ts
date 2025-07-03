import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { User } from '../user/user.model';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthResponse } from './dto/auth-response';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.userService.findByEmailWithPassword(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.validateUser(loginInput.email, loginInput.password);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // Convertir UserEntity vers User (sans le password)
    const userResponse: User = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      access_token,
      user: userResponse,
    };
  }

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userService.findByEmail(
      registerInput.email,
    );
    if (existingUser) {
      throw new UnauthorizedException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      registerInput.password,
      saltRounds,
    );

    // Créer l'utilisateur
    const newUser = await this.userService.createWithPassword({
      email: registerInput.email,
      username: registerInput.username,
      password: hashedPassword,
      role: registerInput.role,
    });

    // Générer le JWT
    const payload = {
      email: newUser.email,
      sub: newUser.id,
      role: newUser.role,
    };
    const access_token = this.jwtService.sign(payload);

    // Convertir UserEntity vers User (sans le password)
    const userResponse: User = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return {
      access_token,
      user: userResponse,
    };
  }
}
