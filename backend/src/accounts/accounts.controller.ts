import { Controller, Get, Post, Patch, Body, Param, Delete, UseGuards, Request, ParseIntPipe, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { PaginationDto } from '../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthenticatedRequest, @Body() data: CreateAccountDto) {
    return this.accountsService.create(req.user.id, req.user.plan, data);
  }

  @Get('summary')
  getSummary(@Request() req: AuthenticatedRequest) {
    return this.accountsService.getSummary(req.user.id);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest, @Query() pagination: PaginationDto) {
    return this.accountsService.findAll(req.user.id, pagination);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.accountsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() data: UpdateAccountDto) {
    return this.accountsService.update(req.user.id, id, data);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.accountsService.delete(req.user.id, id);
  }
}
