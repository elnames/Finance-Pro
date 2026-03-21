import { Controller, Get, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AdminUpdateUserDto } from './dto/update-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  findAll() {
    return this.adminService.findAll();
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

  @Delete('users/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }
}
