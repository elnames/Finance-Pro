import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface CreateUserData {
  nombre: string;
  email: string;
  password: string;
  role?: string;
  plan?: string;
}

export interface DefaultCategoryData {
  nombre: string;
  tipo: string;
  colorHex?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneById(id: number) {
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
    });
  }

  async create(data: CreateUserData) {
    return this.prisma.user.create({
      data,
    });
  }

  async createDefaultCategory(userId: number, data: DefaultCategoryData) {
    return this.prisma.category.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(id: number, data: UpdateProfileDto) {
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
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
