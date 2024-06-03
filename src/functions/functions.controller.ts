import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
}
