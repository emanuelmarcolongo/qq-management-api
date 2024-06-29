import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesRepository } from './profiles.repository';
import { ProfilesService } from './profiles.service';

@Module({
  providers: [ProfilesService, PrismaService, ProfilesRepository],
  controllers: [ProfilesController],
})
export class ProfilesModule {}
