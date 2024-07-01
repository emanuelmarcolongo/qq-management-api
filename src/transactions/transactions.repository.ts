import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDTO } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsRepository {
  constructor(private prisma: PrismaService) {}

  async getAllTransactions() {
    try {
      const transactions = await this.prisma.transaction.findMany({
        include: {
          module: true,
        },
      });

      return transactions;
    } catch (error) {
      console.error('Erro ao buscar todas as transações:', error);
      throw new InternalServerErrorException(
        'Erro ao buscar todas as transações',
      );
    }
  }

  async getTransactionByNameAndModule(name: string, module_id: number) {
    try {
      return await this.prisma.transaction.findFirst({
        where: { name: name, module_id: module_id },
      });
    } catch (error) {
      console.error('Erro ao buscar a transação por nome e módulo:', error);
      throw new InternalServerErrorException(
        'Erro ao buscar a transação por nome e módulo',
      );
    }
  }

  async createTransaction(transaction: CreateTransactionDTO) {
    try {
      return await this.prisma.transaction.create({
        data: transaction,
      });
    } catch (error) {
      console.error('Erro ao criar a transação:', error);
      throw new InternalServerErrorException('Erro ao criar a transação');
    }
  }

  async updateTransaction(id: number, transaction: CreateTransactionDTO) {
    try {
      const updatedTransaction = await this.prisma.transaction.update({
        where: { id },
        data: { ...transaction, updated_at: new Date() },
      });

      return updatedTransaction;
    } catch (error) {
      console.error(`Erro ao atualizar a transação com ID ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao atualizar a transação com ID ${id}`,
      );
    }
  }

  async getTransactionById(id: number) {
    try {
      return await this.prisma.transaction.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error(`Erro ao buscar a transação com ID ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar a transação com ID ${id}`,
      );
    }
  }

  async deleteTransaction(id: number) {
    try {
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
    } catch (error) {
      console.error(`Erro ao deletar a transação com ID ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao deletar a transação com ID ${id}`,
      );
    }
  }

  async getManyTransactionsById(transactions_ids: number[]) {
    try {
      return await this.prisma.transaction.findMany({
        where: {
          id: { in: transactions_ids },
        },
      });
    } catch (error) {
      console.error(
        'Erro ao buscar várias transações pelos IDs fornecidos:',
        error,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar várias transações pelos IDs fornecidos',
      );
    }
  }
}
