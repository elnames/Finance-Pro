import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { TransactionType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Request() req: any,
    @Body() data: { monto: number; tipo: string; descripcion: string; accountId: number; categoryId: number }
  ) {
    return this.transactionsService.create(req.user.id, data);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.transactionsService.findAll(req.user.id);
  }
}
