import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { resolvePagination } from '../common/utils/pagination.util';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { getLimits } from '../common/plan-limits';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Registra una transacción y actualiza el saldo de la cuenta de forma ATÓMICA (ACID).
   */
  async create(userId: number, plan: string, data: { monto: number; tipo: string; descripcion: string; accountId: number; categoryId: number }) {
    const limits = getLimits(plan);
    if (isFinite(limits.transactionsPerMonth)) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const count = await this.prisma.transaction.count({
        where: { account: { userId }, deletedAt: null, fecha: { gte: monthStart, lte: monthEnd } },
      });
      if (count >= limits.transactionsPerMonth) {
        throw new ForbiddenException(`PLAN_LIMIT:transactions:${limits.transactionsPerMonth}`);
      }
    }

    // 1. Verificación de propiedad — only select what is needed (no full row fetch)
    const [account, category] = await Promise.all([
      this.prisma.account.findFirst({ where: { id: data.accountId, userId, deletedAt: null }, select: { id: true } }),
      this.prisma.category.findFirst({ where: { id: data.categoryId, userId, deletedAt: null }, select: { id: true } }),
    ]);

    if (!account) {
      throw new BadRequestException('La cuenta no existe o no pertenece a este usuario');
    }
    if (!category) {
      throw new BadRequestException('La categoría no existe o no pertenece a este usuario');
    }

    // 2. Ejecución con Transacción ACID de Prisma
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Registrar la transacción
      const transaction = await tx.transaction.create({ data });

      // Calcular ajuste de saldo
      const adjustment = data.tipo === 'INGRESO' ? data.monto : -data.monto;

      // Actualizar el saldoActual de la Account — only select what the log needs
      const updatedAccount = await tx.account.update({
        where: { id: data.accountId },
        data: { saldoActual: { increment: adjustment } },
        select: { id: true, saldoActual: true },
      });

      this.logger.log(`Transacción ACID exitosa: TX ${transaction.id} | Cuenta ${account.id} nuevo saldo: ${updatedAccount.saldoActual}`);

      return transaction;
    });
  }

  async findAll(userId: number, pagination: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip } = resolvePagination(pagination);
    // Exclude soft-deleted records; uses @@index([accountId, deletedAt])
    const where = { account: { userId }, deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        // select only the fields the client actually needs — avoids fetching
        // password, internal timestamps, etc. from the joined rows
        select: {
          id: true,
          monto: true,
          tipo: true,
          fecha: true,
          descripcion: true,
          accountId: true,
          categoryId: true,
          createdAt: true,
          account:  { select: { id: true, nombre: true } },
          category: { select: { id: true, nombre: true, tipo: true, colorHex: true } },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Updates a transaction and corrects the account balance atomically.
   *
   * Bug fixed: the original implementation rewrote the transaction row but never
   * adjusted saldoActual, so changes to monto or tipo silently drifted the
   * account balance away from the true sum of its transactions.
   */
  async update(userId: number, id: number, data: UpdateTransactionDto) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, account: { userId }, deletedAt: null },
      select: { id: true, monto: true, tipo: true, accountId: true },
    });
    if (!transaction) throw new NotFoundException('Transacción no encontrada');

    // Recalculate balance only when monto or tipo actually change
    const oldMonto = new Prisma.Decimal(transaction.monto);
    const newMonto = data.monto !== undefined ? new Prisma.Decimal(data.monto) : oldMonto;
    const newTipo = data.tipo !== undefined ? data.tipo : transaction.tipo;

    const oldEffect = transaction.tipo === 'INGRESO' ? oldMonto : oldMonto.neg();
    const newEffect = newTipo === 'INGRESO' ? newMonto : newMonto.neg();
    const balanceDelta = newEffect.minus(oldEffect);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.transaction.update({
        where: { id },
        data,
      });

      if (!balanceDelta.isZero()) {
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { saldoActual: { increment: balanceDelta } },
        });
      }

      return updated;
    });
  }

  /**
   * Soft-deletes a transaction and reverses its balance contribution atomically.
   *
   * Financial records are never hard-deleted to preserve audit history.
   * Sets deletedAt instead of removing the row.
   */
  async delete(userId: number, id: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, account: { userId }, deletedAt: null },
      select: { id: true, monto: true, tipo: true, accountId: true },
    });
    if (!transaction) throw new NotFoundException('Transacción no encontrada');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Reverse balance: INGRESO → subtract; GASTO → add back
      const adjustment = transaction.tipo === 'INGRESO'
        ? new Prisma.Decimal(transaction.monto).neg()
        : new Prisma.Decimal(transaction.monto);

      await tx.account.update({
        where: { id: transaction.accountId },
        data: { saldoActual: { increment: adjustment } },
      });

      // Soft delete — preserve the row for audit
      return tx.transaction.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }
}
