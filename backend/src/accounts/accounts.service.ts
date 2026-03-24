import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { resolvePagination } from '../common/utils/pagination.util';
import { UpdateAccountDto } from './dto/update-account.dto';
import { getLimits } from '../common/plan-limits';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, plan: string, data: { nombre: string; saldoActual: number }) {
    const limits = getLimits(plan);
    if (isFinite(limits.accounts)) {
      const count = await this.prisma.account.count({ where: { userId, deletedAt: null } });
      if (count >= limits.accounts) {
        throw new ForbiddenException(`PLAN_LIMIT:accounts:${limits.accounts}`);
      }
    }
    return this.prisma.account.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: number, pagination: PaginationDto = {}): Promise<PaginatedResult<Record<string, unknown>>> {
    const { page, limit, skip } = resolvePagination(pagination);

    const [data, total] = await Promise.all([
      this.prisma.account.findMany({ where: { userId, deletedAt: null }, skip, take: limit }),
      this.prisma.account.count({ where: { userId, deletedAt: null } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSummary(userId: number) {
    // Push the SUM and COUNT to the DB engine instead of fetching all account
    // rows and reducing in JS. Uses @@index([userId]) on Account.
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [balanceAgg, accountCount, incomeAgg, expenseAgg] = await Promise.all([
      this.prisma.account.aggregate({
        where: { userId, deletedAt: null },
        _sum: { saldoActual: true },
      }),
      this.prisma.account.count({ where: { userId, deletedAt: null } }),
      this.prisma.transaction.aggregate({
        where: {
          account: { userId },
          tipo: 'INGRESO',
          deletedAt: null,
          fecha: { gte: monthStart, lte: monthEnd },
        },
        _sum: { monto: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          account: { userId },
          tipo: 'GASTO',
          deletedAt: null,
          fecha: { gte: monthStart, lte: monthEnd },
        },
        _sum: { monto: true },
      }),
    ]);

    return {
      totalBalance: Number(balanceAgg._sum.saldoActual ?? 0),
      accountCount,
      totalIncome: Number(incomeAgg._sum.monto ?? 0),
      totalExpenses: Number(expenseAgg._sum.monto ?? 0),
    };
  }

  async findOne(userId: number, id: number) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!account) {
      throw new NotFoundException('Cuenta no encontrada');
    }
    return account;
  }

  async delete(userId: number, id: number) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId, deletedAt: null },
      select: { id: true },
    });
    if (!account) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    // Soft-delete the account and all its transactions atomically.
    // The Transaction model has no onDelete:Cascade, so a hard-delete would
    // either fail with a FK constraint error or leave orphaned rows.
    // Financial records must be preserved for audit — soft-delete both.
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const now = new Date();

      // Soft-delete all active transactions belonging to this account
      await tx.transaction.updateMany({
        where: { accountId: id, deletedAt: null },
        data: { deletedAt: now },
      });

      // Soft-delete the account itself
      return tx.account.update({
        where: { id },
        data: { deletedAt: now },
      });
    });
  }

  async update(userId: number, id: number, data: UpdateAccountDto) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!account) {
      throw new NotFoundException('Cuenta no encontrada');
    }
    return this.prisma.account.update({ where: { id }, data });
  }
}
