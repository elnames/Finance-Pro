import { Controller, Get, Patch, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.findOneById(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() data: { nombre?: string; email?: string }) {
    return this.usersService.update(req.user.id, data);
  }

  @Delete('account')
  deleteAccount(@Request() req: any) {
    return this.usersService.delete(req.user.id);
  }
}
