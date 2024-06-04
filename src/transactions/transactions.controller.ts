import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDTO } from './dto/create-transaction.dto';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}
  @Post()
  async createTransaction(@Body() body: CreateTransactionDTO) {
    const transaction = await this.transactionService.createTransaction(body);

    return transaction;
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
