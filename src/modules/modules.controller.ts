import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
}
