import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Module } from '@prisma/client';
import { PayloadUserInfo } from 'src/models/UserModels';
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

  async getUserModules(user: PayloadUserInfo) {
    const userExists = await this.prisma.users.findUnique({
      where: {
        id: user.sub,
      },
    });
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    const { profile_id } = userExists;

    const profile = await this.prisma.profile.findUnique({
      where: { id: profile_id },
      include: {
        profile_modules: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error('Perfil não encontrado');
    }

    return profile.profile_modules.map((pm) => ({
      id: pm.module.id,
      name: pm.module.name,
      description: pm.module.description,
      text_color: pm.module.text_color,
      background_color: pm.module.background_color,
      created_at: pm.module.updated_at,
      updated_at: pm.module.created_at,
    }));
  }

  async getUserModuleById(module_id: number, user: PayloadUserInfo) {
    const userExists = await this.prisma.users.findUnique({
      where: {
        id: user.sub,
      },
    });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    const { profile_id } = userExists;

    const module = await this.prisma.module.findFirst({
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

    if (!module) {
      throw new NotFoundException('Módulo não encontrado para este perfil');
    }

    return {
      id: module.id,
      name: module.name,
      description: module.description,
      transactions: module.transactions
        .filter((t) =>
          t.profile_transactions.some((pt) => pt.profile_id === profile_id),
        )
        .map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          functions: t.profile_transactions
            .flatMap((pt) => pt.transaction.profile_function)
            .filter((pf) => pf.profile_id === profile_id)
            .map((pf) => ({
              id: pf.function.id,
              name: pf.function.name,
              description: pf.function.description,
            })),
        })),
    };
  }
}
