import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async getAllTransactions() {
    return await this.transactionsRepository.getAllTransactions();
  }

  async createTransaction(transaction: CreateTransactionDTO) {
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
  }

  async updateTransaction(id: number, transaction: CreateTransactionDTO) {
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
  }

  async deleteTransaction(id: number) {
    const transactionExists =
      await this.transactionsRepository.getTransactionById(id);

    if (!transactionExists) {
      throw new NotFoundException(`Transação com o id: ${id} não encontrada"`);
    }

    return await this.transactionsRepository.deleteTransaction(id);
  }
}
