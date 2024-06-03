import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
}
