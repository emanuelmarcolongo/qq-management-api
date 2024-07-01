import { Module } from '@nestjs/common';
import { ModulesRepository } from 'src/modules/modules.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
import { UsersRepository } from 'src/users/users.repository';
import { ProfilesController } from './profiles.controller';
import { ProfilesRepository } from './profiles.repository';
import { ProfilesService } from './profiles.service';

@Module({
  providers: [
    ProfilesService,
    PrismaService,
    ProfilesRepository,
    UsersRepository,
    ModulesRepository,
    TransactionsRepository,
  ],
  controllers: [ProfilesController],
})
export class ProfilesModule {}
