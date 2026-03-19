import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecurringTasksService {
  private readonly logger = new Logger(RecurringTasksService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRecurringExpenses() {
    this.logger.log('Procesando gastos recurrentes...');
    const today = new Date().getDate();

    // Buscar gastos recurrentes activos que correspondan al día de hoy
    const recurringExpenses = await this.prisma.recurringExpense.findMany({
      where: {
        diaDelMes: today,
        isActive: true,
      },
      include: {
        user: {
          include: {
            accounts: {
              take: 1, // Por simplicidad, tomamos la primera cuenta del usuario
            },
          },
        },
      },
    } as any);

    for (const expense of recurringExpenses) {
      const account = (expense as any).user.accounts[0];
      if (!account) continue;

      try {
        await this.prisma.$transaction(async (tx: any) => {
          // Crear la transacción
          await tx.transaction.create({
            data: {
              monto: expense.monto,
              tipo: 'GASTO',
              descripcion: `[Automático] ${expense.descripcion}`,
              accountId: account.id,
              categoryId: 1, // Podríamos mejorar buscando una categoría 'General' o similar
            },
          });

          // Actualizar saldo
          await tx.account.update({
            where: { id: account.id },
            data: { saldoActual: { decrement: expense.monto } },
          });
        });
        this.logger.log(`Gasto recurrente procesado: ${expense.descripcion} para usuario ${expense.userId}`);
      } catch (error) {
        this.logger.error(`Error procesando gasto recurrente ${expense.id}: ${(error as any).message}`);
      }
    }
  }
}
