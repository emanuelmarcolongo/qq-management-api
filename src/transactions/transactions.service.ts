import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDTO } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(transaction: CreateTransactionDTO) {
    const nameInUse = await this.prisma.transaction.findFirst({
      where: { name: transaction.name, module_id: transaction.module_id },
    });

    if (nameInUse) {
      throw new ConflictException(
        `Transação com o nome: ${transaction.name} já existe nesse módulo`,
      );
    }

    const newTransaction = await this.prisma.transaction.create({
      data: transaction,
    });

    return newTransaction;
  }
}
