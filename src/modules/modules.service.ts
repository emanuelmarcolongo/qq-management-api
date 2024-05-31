import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Module } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModuleDTO } from './dto/create-module.dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async getModules(): Promise<Module[]> {
    const modules = await this.prisma.module.findMany();

    return modules;
  }

  async createModule(module: CreateModuleDTO) {
    const nameInUse = await this.prisma.module.findFirst({
      where: { name: module.name },
    });

    if (nameInUse)
      throw new ConflictException(
        `Módulo com o nome: ${module.name} já existe`,
      );

    const newModule = await this.prisma.module.create({
      data: module,
    });

    return newModule;
  }

  async updateModule(id: number, module: CreateModuleDTO) {
    const moduleExists = await this.prisma.module.findFirst({ where: { id } });

    if (!moduleExists) {
      throw new NotFoundException(`Módulo com o id: ${id} não encontrado`);
    }

    const nameInUse = await this.prisma.module.findFirst({
      where: {
        name: module.name,
      },
    });

    if (nameInUse.id !== id) {
      throw new ConflictException(
        `Já existe um diferente módulo com esse nome, tente outro nome`,
      );
    }

    const updatedModule = await this.prisma.module.update({
      where: { id },
      data: module,
    });

    return updatedModule;
  }
}
