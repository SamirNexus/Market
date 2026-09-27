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
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.OWNER)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll() {
    return this.products.findAllForAdmin();
  }

  @Get('categories')
  findCategories() {
    return this.products.findAdminCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.products.findOneForAdmin(id);
  }

  @Post()
  create(
    @Body() input: CreateProductDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.products.create(input, actor.id);
  }

  @Put(':id')
  replace(
    @Param('id') id: string,
    @Body() input: UpdateProductDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.products.update(id, input, actor.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() input: UpdateProductDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.products.update(id, input, actor.id);
  }

  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.products.remove(id, actor.id);
  }
}
