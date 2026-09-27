import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ProductsService } from './products.service';

@Public()
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll() {
    return this.products.findPublished();
  }

  @Get('categories')
  findCategories() {
    return this.products.findPublishedCategories();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.products.findPublished(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.products.findPublishedOne(id);
  }
}
