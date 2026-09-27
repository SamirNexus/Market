import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get()
  findAll() {
    return this.products.findAll();
  }

  @Public()
  @Get('categories')
  findCategories() {
    return this.products.findCategories();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.products.findOne(id);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.OWNER)
  @Post()
  create(@Body() input: CreateProductDto) {
    return this.products.create(input);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.OWNER)
  @Put(':id')
  replace(@Param('id') id: string, @Body() input: UpdateProductDto) {
    return this.products.update(id, input);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.OWNER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdateProductDto) {
    return this.products.update(id, input);
  }

  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
