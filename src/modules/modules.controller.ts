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
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/decorators/RequestUserDecorator';
import { PayloadUserInfo } from 'src/models/UserModels';
import { CreateModuleDTO } from './dto/create-module.dto';
import { ModulesService } from './modules.service';

@Controller('modules')
@UseGuards(AuthGuard)
export class ModulesController {
  constructor(private readonly moduleService: ModulesService) {}

  @Get()
  async getModules() {
    const modules = await this.moduleService.getModules();

    return modules;
  }

  @Get('user')
  async getUserModules(@User() user: PayloadUserInfo) {
    const userModules = await this.moduleService.getUserModules(user);
    return userModules;
  }

  @Get(':id')
  async getModuleById(@Param('id', ParseIntPipe) id: number) {
    const detailedModule = await this.moduleService.getModuleById(id);

    return detailedModule;
  }

  @Get(':id/user')
  async getUserModuleById(
    @User() user: PayloadUserInfo,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const detailedModule = await this.moduleService.getUserModuleById(id, user);

    return detailedModule;
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
