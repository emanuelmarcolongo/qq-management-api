import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
}
