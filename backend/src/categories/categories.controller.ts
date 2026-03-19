import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Request() req: any, @Body() data: { nombre: string; tipo: string; colorHex?: string }) {
    return this.categoriesService.create(req.user.id, data);
  }

  @Get()
  findAll(@Request() req: any, @Query('tipo') tipo?: string) {
    if (tipo) {
      return this.categoriesService.findByType(req.user.id, tipo);
    }
    return this.categoriesService.findAll(req.user.id);
  }
}
