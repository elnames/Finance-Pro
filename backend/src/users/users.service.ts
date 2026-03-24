import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

interface UserWithPassword {
  id: number;
  email: string;
  nombre: string;
  role: string;
  plan: string;
  password: string;
}

export interface UserPublic {
  id: number;
  email: string;
  nombre: string;
  role: string;
  plan: string;
  createdAt?: Date;
}

interface CreateUserData {
  nombre: string;
  email: string;
  password: string;
  role?: string;
  plan?: string;
}

interface DefaultCategoryData {
  nombre: string;
  tipo: string;
  colorHex?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<UserWithPassword | null> {
    return this.prisma.user.findUnique({
      where: { email },
    }) as Promise<UserWithPassword | null>;
  }

  async findOneById(id: number): Promise<UserPublic | null> {
    // A02 - Cryptographic Failures: Never expose password hash to clients
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        plan: true,
        createdAt: true,
      },
    }) as Promise<UserPublic | null>;
  }

  async create(data: CreateUserData): Promise<UserWithPassword> {
    return this.prisma.user.create({
      data,
    }) as Promise<UserWithPassword>;
  }

  /**
   * Batch-inserts all default categories for a user in a single DB round-trip.
   * Replaces the N sequential inserts that were previously done in a for loop
   * in AuthService, which had two problems:
   *   1. N+1 round-trips to the database (one per category).
   *   2. Each insert ran outside any transaction, so a mid-loop failure left
   *      the user with partial onboarding data.
   *
   * SQL Server supports createMany (skipDuplicates is not available on SQL
   * Server — duplicate protection is handled by the caller / schema constraints).
   */
  async createDefaultCategories(userId: number, categories: DefaultCategoryData[]) {
    return this.prisma.category.createMany({
      data: categories.map((cat) => ({ ...cat, userId })),
    });
  }

  async update(id: number, data: UpdateProfileDto): Promise<UserPublic> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        plan: true,
      },
    }) as Promise<UserPublic>;
  }

  async delete(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new BadRequestException('La contraseña actual es incorrecta');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }

  async deleteAccount(userId: number, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Contraseña incorrecta');
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Contraseña incorrecta');
    return this.prisma.user.delete({ where: { id: userId } });
  }
}
