import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface ValidatedUser {
  id: number;
  email: string;
  nombre: string;
  role: string;
  plan: string;
}

@Injectable()
export class AuthService {
  // A09 - Security Logging Failures: Use structured Logger instead of console.log
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<ValidatedUser | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result as ValidatedUser;
    }
    // A09 - Log failed login attempts without exposing details
    this.logger.warn(`Failed login attempt for email: ${email}`);
    return null;
  }

  async login(user: ValidatedUser) {
    const payload = { email: user.email, sub: user.id, nombre: user.nombre, role: user.role, plan: user.plan };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
        plan: user.plan,
      },
    };
  }

  async register(userData: { nombre: string; email: string; password: string }) {
    const existingUser = await this.usersService.findOne(userData.email);
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.usersService.create({
        nombre: userData.nombre,
        email: userData.email,
        password: hashedPassword,
      });

      // A09 - Log user creation without sensitive info
      this.logger.log(`New user registered: id=${user.id}`);

      // Onboarding: Crear categorías por defecto
      const defaultCategories = [
        { nombre: 'Sueldo', tipo: 'INGRESO', colorHex: '#10b981' },
        { nombre: 'Ventas', tipo: 'INGRESO', colorHex: '#34d399' },
        { nombre: 'Supermercado', tipo: 'GASTO', colorHex: '#ef4444' },
        { nombre: 'Transporte', tipo: 'GASTO', colorHex: '#f59e0b' },
        { nombre: 'Ocio', tipo: 'GASTO', colorHex: '#8b5cf6' },
        { nombre: 'Renta/Hogar', tipo: 'GASTO', colorHex: '#3b82f6' },
      ];

      for (const cat of defaultCategories) {
        try {
          await this.usersService.createDefaultCategory(user.id, cat);
        } catch (catError) {
          this.logger.warn(`Could not create default category "${cat.nombre}" for user ${user.id}`);
        }
      }

      const payload = { email: user.email, sub: user.id, nombre: user.nombre, role: user.role, plan: user.plan };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          role: user.role,
          plan: user.plan,
        },
      };
    } catch (error) {
      // A09 - Log error without leaking stack traces to clients
      this.logger.error(`Registration error for email ${userData.email}: ${(error as any).message}`);
      throw new InternalServerErrorException('Error al crear el usuario. Inténtalo de nuevo.');
    }
  }

  async loginDemo() {
    const demoEmail = 'demo@financepro.com';
    let user = await this.usersService.findOne(demoEmail);

    if (!user) {
      // A07 - Use secure random demo password (not predictable 'demo123')
      const hashedPassword = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(36), 10);
      user = await this.usersService.create({
        email: demoEmail,
        nombre: 'Inversionista Demo',
        password: hashedPassword,
        role: 'USER',
        plan: 'PREMIUM',
      });

      const demoData = [
        { nombre: 'Salario Corporativo', tipo: 'INGRESO', colorHex: '#10b981' },
        { nombre: 'Dividendos', tipo: 'INGRESO', colorHex: '#3b82f6' },
        { nombre: 'Inversiones', tipo: 'GASTO', colorHex: '#f59e0b' },
        { nombre: 'Mantenimiento', tipo: 'GASTO', colorHex: '#6366f1' },
      ];

      for (const cat of demoData) {
        await this.usersService.createDefaultCategory(user.id, cat);
      }
    }

    return this.login(user as ValidatedUser);
  }
}
