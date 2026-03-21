import { Controller, Get, Post, Patch, Body, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Request() req: any, @Body() data: CreateAccountDto) {
    return this.accountsService.create(req.user.id, data);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.accountsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.accountsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() data: UpdateAccountDto) {
    return this.accountsService.update(req.user.id, id, data);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.accountsService.delete(req.user.id, id);
  }
}
