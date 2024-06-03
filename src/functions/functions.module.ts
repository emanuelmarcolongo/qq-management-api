import { Module } from '@nestjs/common';
import { FunctionsService } from './functions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionsController } from 'src/transactions/transactions.controller';
import { FunctionsController } from './functions.controller';

@Module({
  providers: [FunctionsService, PrismaService],
  controllers: [FunctionsController],
})
export class FunctionsModule {}
