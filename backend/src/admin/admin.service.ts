import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AdminUpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  // A09 - Security Logging: Log admin actions
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePlan(id: number, plan: string) {
    this.logger.log(`Admin updated plan for user ${id} to ${plan}`);
    return this.prisma.user.update({
      where: { id },
      data: { plan },
      select: { id: true, nombre: true, email: true, plan: true, role: true },
    });
  }

  async updateUser(id: number, data: AdminUpdateUserDto) {
    // A01 - Broken Access Control: Only update whitelisted fields from DTO
    const updateData: Record<string, unknown> = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.plan !== undefined) updateData.plan = data.plan;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    this.logger.log(`Admin updated user ${id}: fields=${Object.keys(updateData).filter(k => k !== 'password').join(',')}`);

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, nombre: true, email: true, plan: true, role: true },
    });
  }

  async deleteUser(id: number) {
    this.logger.warn(`Admin deleted user ${id}`);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
