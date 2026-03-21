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

    const recurringExpenses = await this.prisma.recurringExpense.findMany({
      where: {
        diaDelMes: today,
        isActive: true,
      },
      include: {
        user: {
          include: {
            accounts: {
              take: 1,
            },
            // A04 - Insecure Design: Fetch user's first GASTO category to avoid hardcoded ID
            categories: {
              where: { tipo: 'GASTO' },
              take: 1,
            },
          },
        },
      },
    } as any);

    for (const expense of recurringExpenses) {
      const account = (expense as any).user.accounts[0];
      if (!account) {
        this.logger.warn(`No account found for user ${expense.userId}, skipping recurring expense ${expense.id}`);
        continue;
      }

      // A04 - Insecure Design: Use the user's own GASTO category instead of hardcoded ID 1
      const category = (expense as any).user.categories[0];
      if (!category) {
        this.logger.warn(`No GASTO category found for user ${expense.userId}, skipping recurring expense ${expense.id}`);
        continue;
      }

      try {
        await this.prisma.$transaction(async (tx: any) => {
          await tx.transaction.create({
            data: {
              monto: expense.monto,
              tipo: 'GASTO',
              descripcion: `[Automático] ${expense.descripcion}`,
              accountId: account.id,
              categoryId: category.id,
            },
          });

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
