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
import { ModulesService } from './modules.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateModuleDTO } from './dto/create-module.dto';

@Controller('modules')
@UseGuards(AuthGuard)
export class ModulesController {
  constructor(private readonly moduleService: ModulesService) {}

  @Get()
  async getModules() {
    const modules = await this.moduleService.getModules();

    return modules;
  }

  @Post()
  async createModule(@Body() body: CreateModuleDTO) {
    const module = await this.moduleService.createModule(body);

    return module;
  }

  @Put(':id')
  async updateModule(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateModuleDTO,
  ) {
    const updatedModule = await this.moduleService.updateModule(id, body);

    return updatedModule;
  }

  @Delete(':id')
  async deleteModule(@Param('id', ParseIntPipe) id: number) {
    const deletedModule = await this.moduleService.deleteModule(id);

    return deletedModule;
  }
}
