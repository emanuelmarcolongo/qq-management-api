import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Module } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModuleDTO } from './dto/create-module.dto';

@Injectable()
export class ModulesRepository {
  constructor(private prisma: PrismaService) {}

  async getModules(): Promise<Module[]> {
    try {
      const modules = await this.prisma.module.findMany();
      return modules;
    } catch (error) {
      console.error('Erro ao obter módulos:', error);
      throw new InternalServerErrorException('Erro ao obter módulos');
    }
  }

  async getModuleById(moduleId: number) {
    try {
      return await this.prisma.module.findUnique({
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
    } catch (error) {
      console.error('Erro ao obter módulo pelo ID:', error);
      throw new InternalServerErrorException('Erro ao obter módulo pelo ID');
    }
  }

  async getModuleByName(name: string) {
    try {
      const module = await this.prisma.module.findFirst({
        where: { name },
      });
      return module;
    } catch (error) {
      console.error('Erro ao obter módulo pelo nome:', error);
      throw new InternalServerErrorException('Erro ao obter módulo pelo nome');
    }
  }

  async createModule(module: CreateModuleDTO) {
    try {
      const newModule = await this.prisma.module.create({
        data: module,
      });
      return newModule;
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      throw new InternalServerErrorException('Erro ao criar módulo');
    }
  }

  async updateModule(id: number, module: CreateModuleDTO) {
    try {
      return await this.prisma.module.update({
        where: { id },
        data: { ...module, updated_at: new Date() },
      });
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      throw new InternalServerErrorException('Erro ao atualizar módulo');
    }
  }

  async deleteModule(id: number) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
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
    } catch (error) {
      console.error('Erro ao deletar módulo:', error);
      throw new InternalServerErrorException('Erro ao deletar módulo');
    }
  }

  async getUserModuleWithDetail(module_id: number, profile_id: number) {
    try {
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
    } catch (error) {
      console.error('Erro ao obter módulo do usuário com detalhes:', error);
      throw new InternalServerErrorException(
        'Erro ao obter módulo do usuário com detalhes',
      );
    }
  }

  async getManyModulesById(module_ids: number[]) {
    try {
      const modulesExist = await this.prisma.module.findMany({
        where: {
          id: { in: module_ids },
        },
      });
      return modulesExist;
    } catch (error) {
      console.error('Erro ao obter múltiplos módulos pelo ID:', error);
      throw new InternalServerErrorException(
        'Erro ao obter múltiplos módulos pelo ID',
      );
    }
  }
}
