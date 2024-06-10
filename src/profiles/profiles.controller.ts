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
import { ProfilesService } from './profiles.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateProfileDTO,
  CreateProfileModuleDTO,
  DeleteProfileModuleDTO,
} from './dto/create-profile.dto';

@Controller('profiles')
@UseGuards(AuthGuard)
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

  @Post(':id/modules')
  async createProfileModule(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateProfileModuleDTO,
  ) {
    const profileModule = await this.profileService.postProfileModule(id, body);

    return profileModule;
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
}
