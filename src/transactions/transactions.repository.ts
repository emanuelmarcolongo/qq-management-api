import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDTO } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsRepository {
  constructor(private prisma: PrismaService) {}

  async getAllTransactions() {
    const transactions = await this.prisma.transaction.findMany({
      include: {
        module: true,
      },
    });

    return transactions;
  }

  async getTransactionByNameAndModule(name: string, module_id: number) {
    return await this.prisma.transaction.findFirst({
      where: { name: name, module_id: module_id },
    });
  }

  async createTransaction(transaction: CreateTransactionDTO) {
    return await this.prisma.transaction.create({
      data: transaction,
    });
  }

  async updateTransaction(id: number, transaction: CreateTransactionDTO) {
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: { ...transaction, updated_at: new Date() },
    });

    return updatedTransaction;
  }

  async getTransactionById(id: number) {
    return await this.prisma.transaction.findUnique({
      where: { id },
    });
  }

  async deleteTransaction(id: number) {
    const deletedTransaction = await this.prisma.$transaction(
      async (prisma) => {
        await prisma.profile_function.deleteMany({
          where: {
            transaction_id: id,
          },
        });

        await prisma.profile_transaction.deleteMany({
          where: {
            transaction_id: id,
          },
        });

        return await prisma.transaction.delete({
          where: { id },
        });
      },
    );

    return deletedTransaction;
  }
}
