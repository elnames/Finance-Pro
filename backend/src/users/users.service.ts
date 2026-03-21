import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneById(id: number): Promise<any | null> {
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

  async create(data: any): Promise<any> {
    return this.prisma.user.create({
      data,
    });
  }

  async createDefaultCategory(userId: number, data: any) {
    return this.prisma.category.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(id: number, data: any) {
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
