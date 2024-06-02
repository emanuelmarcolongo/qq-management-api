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
import { CreateProfileDTO } from './dto/create-profile.dto';

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
  async updateModule(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateProfileDTO,
  ) {
    const updatedProfile = await this.profileService.updateProfile(id, body);

    return updatedProfile;
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const deletedProfile = await this.profileService.deleteProfile(id);

    return deletedProfile;
  }

  @Get(':id')
  async getProfileInfoById(@Param('id', ParseIntPipe) id: number) {
    const profileWithInfo = await this.profileService.getProfileInfoById(id);

    return profileWithInfo;
  }
}
