import { Injectable } from '@nestjs/common';
import { Module } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModuleDTO } from './dto/create-module.dto';

@Injectable()
export class ModulesRepository {
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

  async getModuleByName(name: string) {
    const module = await this.prisma.module.findFirst({
      where: { name },
    });

    return module;
  }

  async createModule(module: CreateModuleDTO) {
    const newModule = await this.prisma.module.create({
      data: module,
    });

    return newModule;
  }

  async updateModule(id: number, module: CreateModuleDTO) {
    return await this.prisma.module.update({
      where: { id },
      data: { ...module, updated_at: new Date() },
    });
  }

  async deleteModule(id: number) {
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

  async getUserModuleWithDetail(module_id: number, profile_id: number) {
    return await this.prisma.module.findFirst({
      where: {
        id: module_id,
        profile_modules: {
          some: {
            profile_id,
          },
        },
      },
      include: {
        transactions: {
          include: {
            profile_transactions: {
              where: {
                profile_id,
              },
              include: {
                transaction: {
                  include: {
                    profile_function: {
                      where: {
                        profile_id,
                      },
                      include: {
                        function: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getManyModulesById(module_ids: number[]) {
    const modulesExist = await this.prisma.module.findMany({
      where: {
        id: { in: module_ids },
      },
    });

    return modulesExist;
  }
}
