import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: { nombre: string; tipo: string; colorHex?: string }) {
    return this.prisma.category.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.category.findMany({
      where: { userId },
    });
  }

  async findByType(userId: number, tipo: string) {
    return this.prisma.category.findMany({
      where: { userId, tipo },
    });
  }

  async update(userId: number, id: number, data: Partial<CreateCategoryDto>) {
    return this.prisma.category.update({
      where: { id, userId },
      data,
    });
  }

  async delete(userId: number, id: number) {
    return this.prisma.category.delete({
      where: { id, userId },
    });
  }
}
