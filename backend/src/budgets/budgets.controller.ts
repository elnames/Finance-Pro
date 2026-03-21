import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  // A01 - Broken Access Control: use req.user.id (was incorrectly req.user.userId)
  create(@Request() req: any, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.id, createBudgetDto);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('mes', ParseIntPipe) mes: number,
    @Query('anio', ParseIntPipe) anio: number,
  ) {
    return this.budgetsService.findAll(req.user.id, mes, anio);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.remove(req.user.id, id);
  }
}
