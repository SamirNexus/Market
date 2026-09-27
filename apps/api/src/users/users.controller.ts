import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UsersService } from './users.service';

@Roles(UserRole.ADMIN, UserRole.OWNER)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('staff')
  findStaff() {
    return this.users.findStaff();
  }

  @Post('staff')
  createStaff(
    @Body() input: CreateStaffUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.users.createStaff(input, actor);
  }

  @Patch(':id/deactivate')
  deactivate(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.users.deactivate(id, actor);
  }
}
