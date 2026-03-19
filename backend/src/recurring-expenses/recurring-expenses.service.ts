import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async findAll(userId: number) {
    return this.prisma.recurringExpense.findMany({
      where: { userId },
    });
  }

  async toggleActive(userId: number, id: number, isActive: boolean) {
    return this.prisma.recurringExpense.update({
      where: { id, userId },
      data: { isActive },
    });
  }
}
