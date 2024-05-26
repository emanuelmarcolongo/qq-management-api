import { ConflictException, Injectable } from '@nestjs/common';
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
}
