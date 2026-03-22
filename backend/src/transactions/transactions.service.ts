import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Validates that a GASTO transaction will not drive the account balance negative.
   * INGRESO transactions always pass this check.
   */
  private validateSufficientBalance(
    account: { id: number; saldoActual: number },
    tipo: string,
    monto: number,
  ): void {
    if (tipo === 'GASTO' && account.saldoActual < monto) {
      throw new BadRequestException(
        `Saldo insuficiente en la cuenta. Saldo actual: ${account.saldoActual}, monto requerido: ${monto}`,
      );
    }
  }

  /**
   * Registra una transacción y actualiza el saldo de la cuenta de forma ATÓMICA (ACID).
   */
  async create(userId: number, data: { monto: number; tipo: string; descripcion: string; accountId: number; categoryId: number }) {
    // 1. Verificación de propiedad (Seguridad/Aislamiento)
    const [account, category] = await Promise.all([
      this.prisma.account.findFirst({ where: { id: data.accountId, userId } }),
      this.prisma.category.findFirst({ where: { id: data.categoryId, userId } }),
    ]);

    if (!account) {
      throw new BadRequestException('La cuenta no existe o no pertenece a este usuario');
    }
    if (!category) {
      throw new BadRequestException('La categoría no existe o no pertenece a este usuario');
    }

    // 2. Insufficient balance guard
    this.validateSufficientBalance(account, data.tipo, data.monto);

    // 3. Ejecución con Transacción ACID de Prisma
    return this.prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // Registrar la transacción
      const transaction = await tx.transaction.create({
        data,
      });

      // Calcular ajuste de saldo
      const adjustment = data.tipo === 'INGRESO' ? data.monto : -data.monto;

      // Actualizar el saldoActual de la Account
      const updatedAccount = await tx.account.update({
        where: { id: data.accountId },
        data: { saldoActual: { increment: adjustment } },
      });

      this.logger.log(`Transacción ACID exitosa: TX ${transaction.id} | Cuenta ${account.id} nuevo saldo: ${updatedAccount.saldoActual}`);

      return transaction;
    });
  }

  async findAll(userId: number, skip = 0, take = 50) {
    return this.prisma.transaction.findMany({
      where: {
        account: { userId },
      },
      include: {
        account: true,
        category: true,
      },
      orderBy: { fecha: 'desc' },
      skip,
      take,
    });
  }

  async update(userId: number, id: number, data: UpdateTransactionDto) {
    // 1. Fetch the original transaction and its account to capture current state
    const original = await this.prisma.transaction.findFirst({
      where: { id, account: { userId } },
      include: { account: true },
    });
    if (!original) throw new BadRequestException('Transacción no encontrada');

    // 2. Calculate net balance change and validate sufficient funds
    const newMonto = data.monto !== undefined ? data.monto : original.monto;
    const newTipo = data.tipo !== undefined ? data.tipo : original.tipo;

    // Net effect: reverse old impact then apply new impact
    const reversal = original.tipo === 'INGRESO' ? -original.monto : original.monto;
    const adjustment = newTipo === 'INGRESO' ? newMonto : -newMonto;
    const netChange = reversal + adjustment;

    // If net change is negative (balance decreasing), verify sufficient funds
    const currentBalance = original.account.saldoActual;
    if (netChange < 0 && currentBalance + netChange < 0) {
      throw new BadRequestException(
        `Saldo insuficiente para esta modificación. Saldo actual: ${currentBalance}, cambio neto: ${netChange}`,
      );
    }

    // 3. Wrap the update and both balance adjustments in a single ACID transaction
    return this.prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // 4. Reverse the original balance impact
      await tx.account.update({
        where: { id: original.accountId },
        data: { saldoActual: { increment: reversal } },
      });

      // 5. Apply the new balance impact
      await tx.account.update({
        where: { id: original.accountId },
        data: { saldoActual: { increment: adjustment } },
      });

      const updated = await tx.transaction.update({
        where: { id },
        data,
      });

      this.logger.log(`Transacción ACID actualizada: TX ${id} | Cuenta ${original.accountId} saldo ajustado`);

      return updated;
    });
  }

  async delete(userId: number, id: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, account: { userId } },
      include: { account: true },
    });
    if (!transaction) throw new BadRequestException('Transacción no encontrada');

    // Reversing an INGRESO reduces balance -- verify it won't go negative
    const adjustment = transaction.tipo === 'INGRESO' ? -transaction.monto : transaction.monto;
    const deleteBalance = transaction.account.saldoActual;
    if (adjustment < 0 && deleteBalance + adjustment < 0) {
      throw new BadRequestException(
        `No se puede eliminar esta transacción de ingreso: el saldo resultante sería negativo. Saldo actual: ${deleteBalance}`,
      );
    }

    return this.prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { saldoActual: { increment: adjustment } }
      });
      return tx.transaction.delete({ where: { id } });
    });
  }
}
