import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, ParseIntPipe, HttpCode, HttpStatus, Query, ForbiddenException } from '@nestjs/common';
import { RecurringExpensesService } from './recurring-expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { ToggleRecurringExpenseDto } from './dto/toggle-recurring-expense.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getLimits } from '../common/plan-limits';

@UseGuards(JwtAuthGuard)
@Controller('recurring-expenses')
export class RecurringExpensesController {
  constructor(private readonly recurringExpensesService: RecurringExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthenticatedRequest, @Body() data: CreateRecurringExpenseDto) {
    if (!getLimits(req.user.plan).recurring) {
      throw new ForbiddenException('PLAN_LIMIT:recurring:0');
    }
    return this.recurringExpensesService.create(req.user.id, data);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest, @Query() pagination: PaginationDto) {
    if (!getLimits(req.user.plan).recurring) {
      throw new ForbiddenException('PLAN_LIMIT:recurring:0');
    }
    return this.recurringExpensesService.findAll(req.user.id, pagination);
  }

  @Patch(':id/toggle')
  toggle(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() body: ToggleRecurringExpenseDto) {
    return this.recurringExpensesService.toggleActive(req.user.id, id, body.isActive);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.recurringExpensesService.delete(req.user.id, id);
  }
}
