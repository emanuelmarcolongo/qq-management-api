import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDTO } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getAllTransactions() {
    const transactions = await this.prisma.transaction.findMany({
      include: {
        module: true,
      },
    });

    return transactions;
  }

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

  async updateTransaction(id: number, transaction: CreateTransactionDTO) {
    const nameInUse = await this.prisma.transaction.findFirst({
      where: { name: transaction.name, module_id: transaction.module_id },
    });

    if (nameInUse && nameInUse.id !== id) {
      throw new ConflictException(
        `Outra transação com o nome: ${transaction.name} já existe nesse módulo`,
      );
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: { ...transaction, updated_at: new Date() },
    });

    return updatedTransaction;
  }

  async deleteTransaction(id: number) {
    const transactionExists = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transactionExists) {
      throw new NotFoundException(`Transação com o id: ${id} não encontrada"`);
    }

    await this.prisma.profile_function.deleteMany({
      where: {
        transaction_id: id,
      },
    });

    await this.prisma.profile_transaction.deleteMany({
      where: {
        transaction_id: id,
      },
    });

    const deletedTransaction = await this.prisma.transaction.delete({
      where: { id },
    });

    return deletedTransaction;
  }
}
