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
import { CreateFunctionDTO } from './dto/create-function.dto';
import { FunctionsService } from './functions.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('functions')
@UseGuards(AuthGuard)
export class FunctionsController {
  constructor(private readonly functionService: FunctionsService) {}
  @Post()
  async createFunction(@Body() body: CreateFunctionDTO) {
    const func = await this.functionService.createFunction(body);

    return func;
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
}
