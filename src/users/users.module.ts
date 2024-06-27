import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesService } from 'src/profiles/profiles.service';
import { BcryptService } from 'src/auth/bcrypt.service';

@Module({
  providers: [UsersService, PrismaService, ProfilesService, BcryptService],
  controllers: [UsersController],
})
export class UsersModule {}
