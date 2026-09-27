import {
  Body,
  Controller,
  Get,
  Patch,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateMerchantSettingsDto } from './dto/update-merchant-settings.dto';
import { SettingsService } from './settings.service';

@Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.OWNER)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }

  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @Patch()
  update(
    @Body() input: UpdateMerchantSettingsDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.settings.update(input, actor.id);
  }
}
