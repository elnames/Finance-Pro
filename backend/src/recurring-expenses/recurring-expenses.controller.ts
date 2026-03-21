import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { RecurringExpensesService } from './recurring-expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('recurring-expenses')
export class RecurringExpensesController {
  constructor(private readonly recurringExpensesService: RecurringExpensesService) {}

  @Post()
  create(@Request() req: any, @Body() data: CreateRecurringExpenseDto) {
    return this.recurringExpensesService.create(req.user.id, data);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.recurringExpensesService.findAll(req.user.id);
  }

  @Patch(':id/toggle')
  toggle(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
    return this.recurringExpensesService.toggleActive(req.user.id, id, isActive);
  }
}
