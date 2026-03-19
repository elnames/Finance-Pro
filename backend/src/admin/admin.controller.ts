import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
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
}
