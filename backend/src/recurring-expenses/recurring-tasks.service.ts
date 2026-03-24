import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecurringTasksService {
  private readonly logger = new Logger(RecurringTasksService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRecurringExpenses() {
    this.logger.log('Procesando gastos recurrentes...');

    // Use UTC date to be consistent with the UTC-based idempotency window below.
    // FIX 1 (H3 Fintech): also capture diaDelMes values beyond the actual last day of the
    // current month (e.g. day 31 configured but running in February) by including them on
    // the last day of the month.
    const now = new Date();
    const today = now.getUTCDate();
    const lastDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
    const isLastDay = today === lastDayOfMonth;

    const where = {
      isActive: true,
      OR: [
        { diaDelMes: today },
        ...(isLastDay ? [{ diaDelMes: { gt: lastDayOfMonth } }] : []),
      ],
    };

    const include = {
      user: {
        include: {
          accounts: {
            where: { deletedAt: null },
            take: 1,
          },
        },
      },
    };

    // Build an idempotency window: today's date range (00:00:00 – 23:59:59 UTC)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    // FIX 2 (FINDING-012): process in batches of 50 to avoid loading all records into
    // memory at once and prevent DB contention under high user volume.
    const BATCH_SIZE = 50;
    let skip = 0;

    type RecurringExpenseWithUser = Awaited<ReturnType<typeof this.prisma.recurringExpense.findMany>> extends (infer T)[] ? T & {
      user: {
        accounts: { id: number }[];
      };
    } : never;

    let batch: RecurringExpenseWithUser[];

    do {
      batch = await this.prisma.recurringExpense.findMany({
        where,
        take: BATCH_SIZE,
        skip,
        include,
      }) as RecurringExpenseWithUser[];

      for (const expense of batch) {
        const account = expense.user.accounts[0];
        if (!account) {
          this.logger.warn(`No account found for user ${expense.userId}, skipping recurring expense ${expense.id}`);
          continue;
        }

        // Fetch the first category whose tipo matches the recurring expense tipo,
        // filtered at DB level to avoid a wrong-tipo fallback (HIGH-06).
        const categories = await this.prisma.category.findMany({
          where: { deletedAt: null, tipo: expense.tipo, userId: expense.userId },
          take: 1,
          select: { id: true },
        });
        const category = categories[0];
        if (!category) {
          this.logger.warn(`No category found for recurring expense ${expense.id}, skipping`);
          continue;
        }

        // Idempotency guard: skip if a matching automatic transaction already exists today.
        // Match on tipo as well so an INGRESO and a GASTO for the same description
        // are treated as distinct entries.
        const alreadyProcessed = await this.prisma.transaction.findFirst({
          where: {
            accountId: account.id,
            descripcion: `[Automático] ${expense.descripcion}`,
            tipo: expense.tipo,
            fecha: { gte: todayStart, lte: todayEnd },
          },
        });

        if (alreadyProcessed) {
          this.logger.warn(`Gasto recurrente ${expense.id} ya fue procesado hoy, omitiendo para evitar duplicado`);
          continue;
        }

        try {
          // Balance adjustment: INGRESO adds to the account, GASTO subtracts.
          const balanceAdjustment = expense.tipo === 'INGRESO'
            ? new Prisma.Decimal(expense.monto)
            : new Prisma.Decimal(expense.monto).neg();

          await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.transaction.create({
              data: {
                monto: expense.monto,
                tipo: expense.tipo,
                descripcion: `[Automático] ${expense.descripcion}`,
                accountId: account.id,
                categoryId: category.id,
              },
            });

            await tx.account.update({
              where: { id: account.id },
              data: { saldoActual: { increment: balanceAdjustment } },
            });
          });
          this.logger.log(`Gasto recurrente procesado: ${expense.descripcion} para usuario ${expense.userId}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Error procesando gasto recurrente ${expense.id}: ${message}`);
        }
      }

      skip += BATCH_SIZE;
    } while (batch.length === BATCH_SIZE);
  }
}
