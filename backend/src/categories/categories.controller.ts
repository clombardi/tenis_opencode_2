import { Controller, Get, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
}

@Controller('seed')
export class SeedCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('categories')
  seedCategories() {
    return this.categoriesService.seed();
  }
}