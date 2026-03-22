import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private prisma: PrismaService) {}

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

    // 2. Ejecución con Transacción ACID de Prisma
    return this.prisma.$transaction(async (tx: any) => {
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

  async findAll(userId: number) {
    return this.prisma.transaction.findMany({
      where: {
        account: { userId },
      },
      include: {
        account: true,
        category: true,
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async update(userId: number, id: number, data: any) {
    // 1. Fetch the original transaction to capture its current balance impact
    const original = await this.prisma.transaction.findFirst({
      where: { id, account: { userId } },
    });
    if (!original) throw new BadRequestException('Transacción no encontrada');

    // 2. Wrap the update and both balance adjustments in a single ACID transaction
    return this.prisma.$transaction(async (tx: any) => {
      // 3. Reverse the original balance impact
      const reversal = original.tipo === 'INGRESO' ? -original.monto : original.monto;
      await tx.account.update({
        where: { id: original.accountId },
        data: { saldoActual: { increment: reversal } },
      });

      // 4. Apply the new balance impact using the updated monto/tipo (falling back to original values)
      const newMonto = data.monto !== undefined ? data.monto : original.monto;
      const newTipo = data.tipo !== undefined ? data.tipo : original.tipo;
      const adjustment = newTipo === 'INGRESO' ? newMonto : -newMonto;
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
      where: { id, account: { userId } }
    });
    if (!transaction) throw new BadRequestException('Transacción no encontrada');

    return this.prisma.$transaction(async (tx: any) => {
      const adjustment = transaction.tipo === 'INGRESO' ? -transaction.monto : transaction.monto;
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { saldoActual: { increment: adjustment } }
      });
      return tx.transaction.delete({ where: { id } });
    });
  }
}
