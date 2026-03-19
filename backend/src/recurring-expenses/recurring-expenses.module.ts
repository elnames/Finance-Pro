import { Module } from '@nestjs/common';
import { RecurringExpensesService } from './recurring-expenses.service';
import { RecurringExpensesController } from './recurring-expenses.controller';
import { RecurringTasksService } from './recurring-tasks.service';

@Module({
  providers: [RecurringExpensesService, RecurringTasksService],
  controllers: [RecurringExpensesController],
})
export class RecurringExpensesModule {}
