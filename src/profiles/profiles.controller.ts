import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateProfileDTO,
  CreateProfileModuleDTO,
  CreateProfileTransactionDTO,
} from './dto/create-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
@UseGuards(AuthGuard, AdminGuard)
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @Get()
  async getProfiles() {
    const profiles = await this.profileService.getProfiles();

    return profiles;
  }

  @Post()
  async createProfile(@Body() body: CreateProfileDTO) {
    const profile = await this.profileService.createProfile(body);

    return profile;
  }

  @Put(':id')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateProfileDTO,
  ) {
    const updatedProfile = await this.profileService.updateProfile(id, body);

    return updatedProfile;
  }

  @Delete(':id')
  async deleteProfile(@Param('id', ParseIntPipe) id: number) {
    const deletedProfile = await this.profileService.deleteProfile(id);

    return deletedProfile;
  }

  @Get(':id')
  async getProfileInfoById(@Param('id', ParseIntPipe) id: number) {
    const profileWithInfo = await this.profileService.getProfileInfoById(id);

    return profileWithInfo;
  }

  @Get(':id/modules')
  async getProfileAvailableModules(@Param('id', ParseIntPipe) id: number) {
    const availableModules = await this.profileService.getAvailableModules(id);

    return availableModules;
  }

  @Get(':id/modules/:module_id/transactions')
  async getProfileAvailableTransactions(
    @Param('id', ParseIntPipe) id: number,
    @Param('module_id', ParseIntPipe) module_id: number,
  ) {
    const availableTransactions =
      await this.profileService.getAvailableTransactions(id, module_id);

    return availableTransactions;
  }

  @Post(':id/modules')
  async createProfileModule(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateProfileModuleDTO,
  ) {
    const profileModule = await this.profileService.postProfileModule(id, body);

    return profileModule;
  }

  @Post(':id/transaction')
  async createProfileTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateProfileTransactionDTO,
  ) {
    const profileTransaction = await this.profileService.postProfileTransaction(
      id,
      body,
    );

    return profileTransaction;
  }

  @Delete(':profile_id/modules/:module_id')
  async deleteProfileModule(
    @Param('profile_id', ParseIntPipe) profile_id: number,
    @Param('module_id', ParseIntPipe) module_id: number,
  ) {
    const deletedProfileModule = await this.profileService.deleteProfileModule(
      profile_id,
      module_id,
    );

    return { message: 'Relação e dependências deletadas com sucesso' };
  }

  @Delete(':profile_id/transactions/:transaction_id')
  async deleteProfileTransaction(
    @Param('profile_id', ParseIntPipe) profile_id: number,
    @Param('transaction_id', ParseIntPipe) transaction_id: number,
  ) {
    const deletedProfileModule =
      await this.profileService.deleteProfileTransaction(
        profile_id,
        transaction_id,
      );

    return { message: 'Relação e dependências deletadas com sucesso' };
  }
}
