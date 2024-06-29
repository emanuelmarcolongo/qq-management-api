import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsService } from './transactions.service';

@Module({
  providers: [TransactionsService, PrismaService, TransactionsRepository],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
