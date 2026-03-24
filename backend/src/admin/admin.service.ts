import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AdminUpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { resolvePagination } from '../common/utils/pagination.util';

@Injectable()
export class AdminService {
  // A09 - Security Logging: Log admin actions
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  // Paginated — avoids returning all users in a single response.
  // Uses @@index([createdAt]) on User for the ORDER BY.
  async findAll(pagination: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip } = resolvePagination(pagination);

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          nombre: true,
          email: true,
          role: true,
          plan: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updatePlan(id: number, plan: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    this.logger.log(`Admin updated plan for user ${id} to ${plan}`);
    const role = plan === 'ADMIN' ? 'ADMIN' : 'USER';
    return this.prisma.user.update({
      where: { id },
      data: { plan, role },
      select: { id: true, nombre: true, email: true, plan: true, role: true },
    });
  }

  async updateUser(id: number, data: AdminUpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    // A01 - Broken Access Control: Only update whitelisted fields from DTO
    const updateData: Record<string, unknown> = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.plan !== undefined) {
      updateData.plan = data.plan;
      updateData.role = data.plan === 'ADMIN' ? 'ADMIN' : 'USER';
    }
    if (data.role !== undefined && data.plan === undefined) updateData.role = data.role;
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
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    this.logger.warn(`Admin deleted user ${id}`);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
