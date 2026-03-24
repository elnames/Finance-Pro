import { Controller, Get, Patch, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.usersService.findOneById(req.user.id);
  }

  // A03 - Injection: Use DTO to whitelist updatable fields (prevents mass assignment)
  @Patch('profile')
  updateProfile(@Request() req: AuthenticatedRequest, @Body() data: UpdateProfileDto) {
    return this.usersService.update(req.user.id, data);
  }

  @Patch('password')
  changePassword(@Request() req: AuthenticatedRequest, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  @Delete('account')
  deleteAccount(@Request() req: AuthenticatedRequest, @Body() dto: DeleteAccountDto) {
    return this.usersService.deleteAccount(req.user.id, dto.password);
  }
}
