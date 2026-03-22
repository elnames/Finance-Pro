import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: { nombre: string; saldoActual: number }) {
    return this.prisma.account.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.account.findMany({
      where: { userId },
    });
  }

  async findOne(userId: number, id: number) {
    return this.prisma.account.findFirst({
      where: { id, userId },
    });
  }

  async delete(userId: number, id: number) {
    return this.prisma.account.delete({
      where: { id, userId },
    });
  }

  async update(userId: number, id: number, data: UpdateAccountDto) {
    return this.prisma.account.update({
      where: { id, userId },
      data,
    });
  }
}
