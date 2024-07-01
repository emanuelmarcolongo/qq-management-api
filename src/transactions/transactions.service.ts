import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { errorHandler } from 'src/utils/ErrorHandler';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async getAllTransactions() {
    try {
      return await this.transactionsRepository.getAllTransactions();
    } catch (error) {
      errorHandler(error, 'Erro ao buscar todas as transações');
    }
  }

  async createTransaction(transaction: CreateTransactionDTO) {
    try {
      const nameInUse =
        await this.transactionsRepository.getTransactionByNameAndModule(
          transaction.name,
          transaction.module_id,
        );

      if (nameInUse) {
        throw new ConflictException(
          `Transação com o nome: ${transaction.name} já existe nesse módulo`,
        );
      }

      return await this.transactionsRepository.createTransaction(transaction);
    } catch (error) {
      errorHandler(error, 'Erro ao criar a transação');
    }
  }

  async updateTransaction(id: number, transaction: CreateTransactionDTO) {
    try {
      const nameInUse =
        await this.transactionsRepository.getTransactionByNameAndModule(
          transaction.name,
          transaction.module_id,
        );

      if (nameInUse && nameInUse.id !== id) {
        throw new ConflictException(
          `Outra transação com o nome: ${transaction.name} já existe nesse módulo`,
        );
      }

      return this.transactionsRepository.updateTransaction(id, transaction);
    } catch (error) {
      errorHandler(error, `Erro ao atualizar a transação com ID ${id}`);
    }
  }

  async deleteTransaction(id: number) {
    try {
      const transactionExists =
        await this.transactionsRepository.getTransactionById(id);

      if (!transactionExists) {
        throw new NotFoundException(`Transação com o id: ${id} não encontrada`);
      }

      return await this.transactionsRepository.deleteTransaction(id);
    } catch (error) {
      errorHandler(error, `Erro ao deletar a transação com ID ${id}:`);
    }
  }
}
