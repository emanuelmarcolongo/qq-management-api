import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesService } from 'src/profiles/profiles.service';

@Module({
  providers: [UsersService, PrismaService, ProfilesService],
  controllers: [UsersController],
})
export class UsersModule {}
