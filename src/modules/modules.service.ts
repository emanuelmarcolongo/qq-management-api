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

  async getModuleById(moduleId: number) {
    return this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        transactions: {
          select: {
            id: true,
            name: true,
            description: true,
            created_at: true,
          },
        },
        functions: {
          select: {
            id: true,
            name: true,
            description: true,
            created_at: true,
          },
        },
      },
    });
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

    if (nameInUse && nameInUse.id !== id) {
      throw new ConflictException(
        `Já existe um diferente módulo com esse nome, tente outro nome`,
      );
    }

    const updatedModule = await this.prisma.module.update({
      where: { id },
      data: { ...module, updated_at: new Date() },
    });

    return updatedModule;
  }

  async deleteModule(id: number) {
    const moduleExists = await this.prisma.module.findFirst({
      where: { id },
    });

    if (!moduleExists) {
      throw new NotFoundException(`Módulo com o ID dado não encontrado`);
    }
    return this.prisma.$transaction(async (prisma) => {
      await prisma.profile_function.deleteMany({
        where: { function: { module_id: id } },
      });

      await prisma.profile_transaction.deleteMany({
        where: { transaction: { module_id: id } },
      });

      await prisma.profile_module.deleteMany({
        where: {
          module_id: id,
        },
      });

      await prisma.transaction.deleteMany({
        where: { module_id: id },
      });
      await prisma.function.deleteMany({
        where: { module_id: id },
      });

      return prisma.module.delete({
        where: { id: id },
      });
    });
  }
}
