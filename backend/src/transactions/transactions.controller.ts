import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { PaginationDto } from '../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthenticatedRequest, @Body() data: CreateTransactionDto) {
    return this.transactionsService.create(req.user.id, req.user.plan, data);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest, @Query() pagination: PaginationDto) {
    return this.transactionsService.findAll(req.user.id, pagination);
  }

  @Patch(':id')
  update(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() data: UpdateTransactionDto) {
    return this.transactionsService.update(req.user.id, id, data);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.delete(req.user.id, id);
  }
}
