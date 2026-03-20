import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  findAll() {
    return this.adminService.findAll();
  }

  @Patch('users/:id/plan')
  updatePlan(@Param('id') id: string, @Body('plan') plan: string) {
    const planValue = typeof plan === 'object' ? (plan as any).plan : plan;
    return this.adminService.updatePlan(+id, planValue);
  }

  @Patch('users/:id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(+id, data);
  }

  @Delete('users/:id')
  remove(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }
}
