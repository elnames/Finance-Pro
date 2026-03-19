import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
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
    return this.prisma.user.update({
      where: { id },
      data: { plan },
    });
  }

  async updateUser(id: number, data: any) {
    const updateData: any = { ...data };
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
}
