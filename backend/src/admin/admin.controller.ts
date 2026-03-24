import { Controller, Get, Patch, Delete, Param, Body, UseGuards, ParseIntPipe, Request, BadRequestException, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AdminUpdateUserDto } from './dto/update-user.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  findAll(@Query() pagination: PaginationDto) {
    return this.adminService.findAll(pagination);
  }

  // A03 - Injection: Validate plan value via DTO whitelist
  @Patch('users/:id/plan')
  updatePlan(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanDto) {
    return this.adminService.updatePlan(id, dto.plan);
  }

  // A01 - Broken Access Control: Strict DTO prevents mass assignment of arbitrary fields
  @Patch('users/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: AdminUpdateUserDto) {
    return this.adminService.updateUser(id, data);
  }

  // A01 - Broken Access Control: Prevent admin from deleting their own account
  // through the admin panel (use /users/account for self-deletion).
  @Delete('users/:id')
  remove(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    if (req.user.id === id) {
      throw new BadRequestException('No puedes eliminar tu propia cuenta desde el panel de administración');
    }
    return this.adminService.deleteUser(id);
  }
}
