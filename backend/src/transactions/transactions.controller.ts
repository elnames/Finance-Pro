import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Request() req: any, @Body() data: CreateTransactionDto) {
    return this.transactionsService.create(req.user.id, data);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.transactionsService.findAll(
      req.user.id,
      skip !== undefined ? parseInt(skip, 10) : undefined,
      take !== undefined ? parseInt(take, 10) : undefined,
    );
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() data: UpdateTransactionDto) {
    return this.transactionsService.update(req.user.id, id, data);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.delete(req.user.id, id);
  }
}
