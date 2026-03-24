import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { resolvePagination } from '../common/utils/pagination.util';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { getLimits } from '../common/plan-limits';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, plan: string, data: { nombre: string; tipo: string; colorHex?: string }) {
    const limits = getLimits(plan);
    if (isFinite(limits.categories)) {
      const count = await this.prisma.category.count({ where: { userId, deletedAt: null } });
      if (count >= limits.categories) {
        throw new ForbiddenException(`PLAN_LIMIT:categories:${limits.categories}`);
      }
    }
    return this.prisma.category.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: number, pagination: PaginationDto = {}): Promise<PaginatedResult<Record<string, unknown>>> {
    const { page, limit, skip } = resolvePagination(pagination);

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({ where: { userId, deletedAt: null }, skip, take: limit }),
      this.prisma.category.count({ where: { userId, deletedAt: null } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(userId: number, id: number) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  // Uses @@index([userId, tipo]). A hard cap guards against accidental bulk
  // responses; in normal use a user won't have thousands of categories per type.
  async findByType(userId: number, tipo: string) {
    return this.prisma.category.findMany({
      where: { userId, tipo, deletedAt: null },
      select: { id: true, nombre: true, tipo: true, colorHex: true },
      take: 200,
    });
  }

  async update(userId: number, id: number, data: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(userId: number, id: number) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    const txCount = await this.prisma.transaction.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (txCount > 0) {
      throw new BadRequestException(`No se puede eliminar: tiene ${txCount} transacciones activas`);
    }
    return this.prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
