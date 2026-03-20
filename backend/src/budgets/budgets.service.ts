import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: any) {
    const categoryId = Number(dto.categoryId);
    const monto = Number(dto.monto);
    const mes = Number(dto.mes);
    const anio = Number(dto.anio);

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Upsert: Si ya existe un presupuesto para esta categoría/mes/año, lo actualizamos
    const existing = await this.prisma.budget.findFirst({
      where: {
        categoryId: categoryId,
        mes: mes,
        anio: anio,
      },
    });

    if (existing) {
      return this.prisma.budget.update({
        where: { id: existing.id },
        data: { monto: monto },
      });
    }

    return this.prisma.budget.create({
      data: {
        monto,
        mes,
        anio,
        categoryId
      }
    });
  }

  async findAll(userId: number, mes: number, anio: number) {
    return this.prisma.budget.findMany({
      where: {
        mes,
        anio,
        category: {
          userId,
        },
      },
      include: {
        category: true,
      },
    });
  }

  async remove(userId: number, id: number) {
    const budget = await this.prisma.budget.findFirst({
      where: { 
        id,
        category: { userId }
      }
    });

    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }

    return this.prisma.budget.delete({ where: { id } });
  }
}
