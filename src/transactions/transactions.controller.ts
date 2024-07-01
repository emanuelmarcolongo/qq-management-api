import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard, AdminGuard)
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}
  @Post()
  async createTransaction(@Body() body: CreateTransactionDTO) {
    const transaction = await this.transactionService.createTransaction(body);

    return transaction;
  }

  @Get()
  async getTransactions() {
    const transactions = await this.transactionService.getAllTransactions();

    return transactions;
  }

  @Put(':id')
  async updateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateTransactionDTO,
  ) {
    const updatedTransaction = await this.transactionService.updateTransaction(
      id,
      body,
    );

    return updatedTransaction;
  }

  @Delete(':id')
  async deleteTransaction(@Param('id', ParseIntPipe) id: number) {
    const deletedTransaction =
      await this.transactionService.deleteTransaction(id);

    return deletedTransaction;
  }
}
