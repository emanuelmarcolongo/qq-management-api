import { Module } from '@nestjs/common';
import { BcryptService } from 'src/auth/bcrypt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesService } from 'src/profiles/profiles.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  providers: [
    UsersService,
    PrismaService,
    ProfilesService,
    BcryptService,
    UsersRepository,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
