import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesRepository } from 'src/profiles/profiles.repository';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
import { FunctionsController } from './functions.controller';
import { FunctionsRepository } from './functions.repository';
import { FunctionsService } from './functions.service';

@Module({
  providers: [
    FunctionsService,
    PrismaService,
    FunctionsRepository,
    ProfilesRepository,
    TransactionsRepository,
  ],
  controllers: [FunctionsController],
})
export class FunctionsModule {}
