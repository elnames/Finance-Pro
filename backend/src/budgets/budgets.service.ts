import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { getLimits } from '../common/plan-limits';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, plan: string, dto: CreateBudgetDto) {
    const categoryId = Number(dto.categoryId);
    const monto = Number(dto.monto);
    const mes = Number(dto.mes);
    const anio = Number(dto.anio);

    const limits = getLimits(plan);
    if (isFinite(limits.budgets)) {
      const count = await this.prisma.budget.count({ where: { userId, mes, anio } });
      if (count >= limits.budgets) {
        throw new ForbiddenException(`PLAN_LIMIT:budgets:${limits.budgets}`);
      }
    }

    // Guard: monto=0 causes division-by-zero in percentage calculations
    if (!monto || monto <= 0 || isNaN(monto)) {
      throw new BadRequestException('El monto del presupuesto debe ser mayor que cero');
    }

    // Ownership check: ensure the category belongs to this user
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, userId: true },
    });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Atomic upsert using the @@unique([categoryId, mes, anio]) constraint.
    // Replaces the previous find-then-create/update pattern that had a race
    // condition under concurrent requests.
    return this.prisma.budget.upsert({
      where: { categoryId_mes_anio: { categoryId, mes, anio } },
      update: { monto },
      create: { monto, mes, anio, categoryId, userId },
    });
  }

  async findAll(userId: number, mes: number, anio: number) {
    // Uses the @@index([userId, mes, anio]) index — no JOIN needed to check ownership.
    return this.prisma.budget.findMany({
      where: { userId, mes, anio },
      include: {
        category: {
          select: { id: true, nombre: true, tipo: true, colorHex: true },
        },
      },
    });
  }

  async findOne(userId: number, id: number) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: {
        category: {
          select: { id: true, nombre: true, tipo: true, colorHex: true },
        },
      },
    });
    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }
    return budget;
  }

  async update(userId: number, id: number, data: { monto: number }) {
    // Ownership check via the direct userId field (no JOIN)
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }
    return this.prisma.budget.update({
      where: { id },
      data: { monto: data.monto },
    });
  }

  async remove(userId: number, id: number) {
    // Ownership check via the direct userId field (no JOIN)
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }

    return this.prisma.budget.delete({ where: { id } });
  }
}
