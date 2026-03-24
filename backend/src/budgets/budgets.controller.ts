import { Controller, Get, Post, Patch, Body, Param, Delete, UseGuards, Request, Query, ParseIntPipe, DefaultValuePipe, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthenticatedRequest, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.id, req.user.plan, createBudgetDto);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('mes', new DefaultValuePipe(new Date().getMonth() + 1), ParseIntPipe) mes: number,
    @Query('anio', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) anio: number,
  ) {
    if (mes < 1 || mes > 12) {
      throw new BadRequestException('El parámetro mes debe estar entre 1 y 12');
    }
    if (anio < 2000 || anio > 2100) {
      throw new BadRequestException('El parámetro anio debe estar entre 2000 y 2100');
    }
    return this.budgetsService.findAll(req.user.id, mes, anio);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(req.user.id, id, updateBudgetDto);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.remove(req.user.id, id);
  }
}
