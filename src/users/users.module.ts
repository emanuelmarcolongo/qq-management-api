import { Module } from '@nestjs/common';
import { BcryptService } from 'src/auth/bcrypt.service';
import { ModulesRepository } from 'src/modules/modules.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesRepository } from 'src/profiles/profiles.repository';
import { ProfilesService } from 'src/profiles/profiles.service';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
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
    ProfilesRepository,
    ModulesRepository,
    TransactionsRepository,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
