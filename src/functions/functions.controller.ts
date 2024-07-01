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
import {
  CreateFunctionDTO,
  CreateProfileFunctionDTO,
} from './dto/create-function.dto';
import { FunctionsService } from './functions.service';

@Controller('functions')
@UseGuards(AuthGuard, AdminGuard)
export class FunctionsController {
  constructor(private readonly functionService: FunctionsService) {}
  @Post()
  async createFunction(@Body() body: CreateFunctionDTO) {
    const func = await this.functionService.createFunction(body);

    return func;
  }

  @Get()
  async getAllFunctions() {
    const functions = await this.functionService.getAllFunctions();

    return functions;
  }

  @Put(':id')
  async updateFunction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateFunctionDTO,
  ) {
    const updatedFunction = await this.functionService.updateFunction(id, body);

    return updatedFunction;
  }

  @Delete(':id')
  async deleteFunction(@Param('id', ParseIntPipe) id: number) {
    const deletedFunction = await this.functionService.deleteFunction(id);

    return deletedFunction;
  }

  @Get('profiles/:profile_id/transactions/:transaction_id')
  async getProfileAvailableTransactions(
    @Param('profile_id', ParseIntPipe) profile_id: number,
    @Param('transaction_id', ParseIntPipe) transaction_id: number,
  ) {
    const availableTransactions =
      await this.functionService.getAvailableFunctions(
        profile_id,
        transaction_id,
      );

    return availableTransactions;
  }

  @Delete(':id/profile/:profile_id/transaction/:transaction_id')
  async deleteProfileFunction(
    @Param('id', ParseIntPipe) id: number,
    @Param('profile_id', ParseIntPipe) profile_id: number,
    @Param('transaction_id', ParseIntPipe) transaction_id: number,
  ) {
    const deletedFunction = await this.functionService.deleteProfileFunction(
      profile_id,
      id,
      transaction_id,
    );

    return { message: 'Relação e dependências deletadas com sucesso' };
  }

  @Post('profiles/:profile_id/transactions/:transaction_id')
  async createProfileFunction(
    @Param('profile_id', ParseIntPipe) profile_id: number,
    @Param('transaction_id', ParseIntPipe) transaction_id: number,
    @Body() body: CreateProfileFunctionDTO,
  ) {
    const profileFunction = await this.functionService.postProfileFunction(
      profile_id,
      transaction_id,
      body,
    );

    return profileFunction;
  }
}
