import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { resolvePagination } from '../common/utils/pagination.util';

@Injectable()
export class RecurringExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: { descripcion: string; monto: number; diaDelMes: number }) {
    return this.prisma.recurringExpense.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: number, pagination: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip } = resolvePagination(pagination);

    const [data, total] = await Promise.all([
      this.prisma.recurringExpense.findMany({ where: { userId }, skip, take: limit }),
      this.prisma.recurringExpense.count({ where: { userId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async toggleActive(userId: number, id: number, isActive: boolean) {
    const expense = await this.prisma.recurringExpense.findFirst({
      where: { id, userId },
    });
    if (!expense) {
      throw new NotFoundException('Gasto recurrente no encontrado');
    }
    return this.prisma.recurringExpense.update({
      where: { id },
      data: { isActive },
    });
  }

  async delete(userId: number, id: number) {
    const expense = await this.prisma.recurringExpense.findFirst({
      where: { id, userId },
    });
    if (!expense) {
      throw new NotFoundException('Gasto recurrente no encontrado');
    }
    return this.prisma.recurringExpense.delete({ where: { id } });
  }
}
