import { Controller, Get, Patch, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.findOneById(req.user.id);
  }

  // A03 - Injection: Use DTO to whitelist updatable fields (prevents mass assignment)
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() data: UpdateProfileDto) {
    return this.usersService.update(req.user.id, data);
  }

  @Delete('account')
  deleteAccount(@Request() req: any) {
    return this.usersService.delete(req.user.id);
  }
}
