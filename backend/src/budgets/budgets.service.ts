import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateBudgetDto) {
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
        userId,
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
        categoryId,
        userId,
      }
    });
  }

  async findAll(userId: number, mes: number, anio: number) {
    const budgets = await this.prisma.budget.findMany({
      where: {
        userId,
        mes,
        anio,
      },
      include: {
        category: true,
      },
    });

    if (budgets.length === 0) return [];

    // Compute gastoActual server-side by aggregating GASTO transactions per category
    const startDate = new Date(anio, mes - 1, 1);
    const endDate = new Date(anio, mes, 1);
    const categoryIds = budgets.map((b) => b.categoryId);

    const spending = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        categoryId: { in: categoryIds },
        tipo: 'GASTO',
        fecha: {
          gte: startDate,
          lt: endDate,
        },
        account: { userId },
      },
      _sum: { monto: true },
    });

    const spendingMap = new Map<number, number>();
    for (const row of spending) {
      spendingMap.set(row.categoryId, row._sum.monto ?? 0);
    }

    return budgets.map((budget) => ({
      ...budget,
      gastoActual: spendingMap.get(budget.categoryId) ?? 0,
    }));
  }

  async remove(userId: number, id: number) {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id,
        userId,
      }
    });

    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }

    return this.prisma.budget.delete({ where: { id } });
  }
}
