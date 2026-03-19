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
    return this.prisma.user.findUnique({
      where: { id },
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
}
