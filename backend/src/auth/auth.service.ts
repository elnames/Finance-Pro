import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
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

  async register(userData: any) {
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

      console.log('User created:', user.id);

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
          // @ts-ignore
          await this.usersService.createDefaultCategory(user.id, cat);
        } catch (catError) {
          console.error(`Error creating category ${cat.nombre} for user ${user.id}:`, catError);
          // No lanzamos error para no romper el registro si fallan las categorías
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
      console.error('Registration error detail:', error);
      throw new InternalServerErrorException('Error al crear el usuario. Inténtalo de nuevo.');
    }
  }

  async loginDemo() {
    const demoEmail = 'demo@financepro.com';
    let user = await this.usersService.findOne(demoEmail);

    if (!user) {
      // Crear usuario demo si no existe
      const hashedPassword = await bcrypt.hash('demo123', 10);
      user = await this.usersService.create({
        email: demoEmail,
        nombre: 'Inversionista Demo',
        password: hashedPassword,
        role: 'USER',
        plan: 'PREMIUM',
      });

      // Crear categorías y datos iniciales para la demo
      const demoData = [
        { nombre: 'Salario Corporativo', tipo: 'INGRESO', colorHex: '#10b981' },
        { nombre: 'Dividendos', tipo: 'INGRESO', colorHex: '#3b82f6' },
        { nombre: 'Inversiones', tipo: 'GASTO', colorHex: '#f59e0b' },
        { nombre: 'Mantenimiento', tipo: 'GASTO', colorHex: '#6366f1' },
      ];

      for (const cat of demoData) {
        // @ts-ignore
        await this.usersService.createDefaultCategory(user.id, cat);
      }
    }

    return this.login(user);
  }
}
