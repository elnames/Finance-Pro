import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { PaginationDto } from '../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthenticatedRequest, @Body() data: CreateCategoryDto) {
    return this.categoriesService.create(req.user.id, req.user.plan, data);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest, @Query('tipo') tipo?: string, @Query() pagination?: PaginationDto) {
    // A03 - Injection: Whitelist the 'tipo' query parameter
    if (tipo && (tipo === 'INGRESO' || tipo === 'GASTO')) {
      return this.categoriesService.findByType(req.user.id, tipo);
    }
    return this.categoriesService.findAll(req.user.id, pagination);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() data: UpdateCategoryDto) {
    return this.categoriesService.update(req.user.id, id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.delete(req.user.id, id);
  }
}
