import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfileDTO } from './dto/create-profile.dto';

@Injectable()
export class ProfilesRepository {
  constructor(private prisma: PrismaService) {}

  async findProfileWithProfileModules(profile_id: number) {
    try {
      return await this.prisma.profile.findUnique({
        where: { id: profile_id },
        include: {
          profile_modules: {
            include: {
              module: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Erro ao encontrar perfil com módulos:', error);
      throw new InternalServerErrorException(
        'Erro ao encontrar perfil com módulos',
      );
    }
  }

  async getProfileById(id: number) {
    try {
      return await this.prisma.profile.findFirst({
        where: { id },
      });
    } catch (error) {
      console.error('Erro ao obter perfil pelo ID:', error);
      throw new InternalServerErrorException('Erro ao obter perfil pelo ID');
    }
  }

  async getProfileByName(name: string) {
    try {
      return await this.prisma.profile.findFirst({
        where: { name },
      });
    } catch (error) {
      console.error('Erro ao obter perfil pelo nome:', error);
      throw new InternalServerErrorException('Erro ao obter perfil pelo nome');
    }
  }

  async getProfiles(): Promise<Profile[]> {
    try {
      return await this.prisma.profile.findMany();
    } catch (error) {
      console.error('Erro ao obter perfis:', error);
      throw new InternalServerErrorException('Erro ao obter perfis');
    }
  }

  async createProfile(profile: CreateProfileDTO) {
    try {
      return await this.prisma.profile.create({
        data: profile,
      });
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      throw new InternalServerErrorException('Erro ao criar perfil');
    }
  }

  async getConflictingProfile(id: number, name: string) {
    try {
      return await this.prisma.profile.findFirst({
        where: {
          OR: [{ name }],
          NOT: { id },
        },
      });
    } catch (error) {
      console.error('Erro ao obter perfil conflitante:', error);
      throw new InternalServerErrorException(
        'Erro ao obter perfil conflitante',
      );
    }
  }

  async updateProfile(id: number, profile: CreateProfileDTO) {
    try {
      return await this.prisma.profile.update({
        where: { id },
        data: {
          ...profile,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new InternalServerErrorException('Erro ao atualizar perfil');
    }
  }

  async deleteProfile(id: number) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.profile_function.deleteMany({
          where: { profile_id: id },
        });
        await prisma.profile_transaction.deleteMany({
          where: { profile_id: id },
        });
        await prisma.profile_module.deleteMany({
          where: { profile_id: id },
        });
        return await prisma.profile.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      throw new InternalServerErrorException('Erro ao deletar perfil');
    }
  }

  async getProfileInfoById(profileId: number) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          profile_modules: {
            include: {
              module: {
                include: {
                  transactions: {
                    where: {
                      profile_transactions: {
                        some: {
                          profile_id: profileId,
                        },
                      },
                    },
                    include: {
                      profile_transactions: true,
                      profile_function: {
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

      if (!profile) {
        throw new NotFoundException(
          `Perfil com o Id fornecido não encontrado!`,
        );
      }

      const mappedProfile = {
        id: profile.id,
        name: profile.name,
        description: profile.description,
        modules: profile.profile_modules.map((pm) => ({
          id: pm.module.id,
          name: pm.module.name,
          description: pm.module.description,
          transactions: pm.module.transactions.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            functions: t.profile_function.map((pf) => ({
              id: pf.function.id,
              name: pf.function.name,
              description: pf.function.description,
            })),
          })),
        })),
      };

      return mappedProfile;
    } catch (error) {
      console.error('Erro ao obter informações do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao obter informações do perfil',
      );
    }
  }

  async getModuleRelation(module_id: number, profile_id: number) {
    try {
      return await this.prisma.profile_module.findFirst({
        where: {
          module_id,
          profile_id,
        },
      });
    } catch (error) {
      console.error('Erro ao obter relação do módulo:', error);
      throw new InternalServerErrorException('Erro ao obter relação do módulo');
    }
  }

  async getProfileAvailableTransactions(profile_id: number, module_id: number) {
    try {
      return await this.prisma.transaction.findMany({
        where: {
          id: {
            notIn: (
              await this.prisma.profile_transaction.findMany({
                where: { profile_id },
                select: { transaction_id: true },
              })
            ).map((pm) => pm.transaction_id),
          },
          module_id: module_id,
        },
      });
    } catch (error) {
      console.error('Erro ao obter transações disponíveis do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao obter transações disponíveis do perfil',
      );
    }
  }

  async getProfileAvailableModules(profile_id: number) {
    try {
      return await this.prisma.module.findMany({
        where: {
          id: {
            notIn: (
              await this.prisma.profile_module.findMany({
                where: { profile_id },
                select: { module_id: true },
              })
            ).map((pm) => pm.module_id),
          },
        },
      });
    } catch (error) {
      console.error('Erro ao obter módulos disponíveis do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao obter módulos disponíveis do perfil',
      );
    }
  }

  async getProfileModuleRelation(profile_id: number, module_id: number) {
    try {
      return await this.prisma.profile_module.findFirst({
        where: {
          profile_id,
          module_id,
        },
      });
    } catch (error) {
      console.error('Erro ao obter relação do módulo do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao obter relação do módulo do perfil',
      );
    }
  }

  async createProfileModulesRelation(profile_id: number, moduleIds: number[]) {
    try {
      return await this.prisma.$transaction(
        moduleIds.map((moduleId) =>
          this.prisma.profile_module.upsert({
            where: {
              profile_id_module_id: {
                profile_id,
                module_id: moduleId,
              },
            },
            update: {},
            create: {
              profile_id,
              module_id: moduleId,
            },
          }),
        ),
      );
    } catch (error) {
      console.error('Erro ao criar relação de módulos do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao criar relação de módulos do perfil',
      );
    }
  }

  async deleteProfileModuleRelation(
    profile_id: number,
    module_id: number,
    profile_module_id: number,
  ) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.profile_function.deleteMany({
          where: {
            profile_id,
            function: {
              module_id,
            },
          },
        });

        await prisma.profile_transaction.deleteMany({
          where: {
            profile_id,
            transaction: {
              module_id,
            },
          },
        });

        await prisma.profile_module.delete({
          where: {
            id: profile_module_id,
          },
        });
      });
    } catch (error) {
      console.error('Erro ao deletar relação do módulo do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao deletar relação do módulo do perfil',
      );
    }
  }

  async createProfileTransactionRelation(
    profile_id: number,
    transactionIds: number[],
  ) {
    try {
      return await this.prisma.$transaction(
        transactionIds.map((transaction_id) =>
          this.prisma.profile_transaction.upsert({
            where: {
              profile_id_transaction_id: {
                profile_id,
                transaction_id,
              },
            },
            update: {},
            create: {
              profile_id,
              transaction_id,
            },
          }),
        ),
      );
    } catch (error) {
      console.error('Erro ao criar relação de transações do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao criar relação de transações do perfil',
      );
    }
  }

  async getProfileTransactionRelation(
    profile_id: number,
    transaction_id: number,
  ) {
    try {
      return await this.prisma.profile_transaction.findFirst({
        where: {
          profile_id,
          transaction_id,
        },
      });
    } catch (error) {
      console.error('Erro ao obter relação de transação do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao obter relação de transação do perfil',
      );
    }
  }

  async deleteProfileTransactionRelation(
    profile_id: number,
    transaction_id: number,
  ) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.profile_function.deleteMany({
          where: {
            profile_id,
            transaction_id,
          },
        });

        await prisma.profile_transaction.deleteMany({
          where: {
            profile_id,
            transaction_id,
          },
        });
      });
    } catch (error) {
      console.error('Erro ao deletar relação de transação do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao deletar relação de transação do perfil',
      );
    }
  }

  async getProfileFunctionRelation(profile_id: number, function_id: number) {
    try {
      return await this.prisma.profile_function.findFirst({
        where: {
          profile_id,
          function_id,
        },
      });
    } catch (error) {
      console.error('Erro ao obter relação de função do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao obter relação de função do perfil',
      );
    }
  }

  async deleteProfileFunctionRelation(
    profile_id: number,
    transaction_id: number,
    function_id: number,
  ) {
    try {
      return await this.prisma.profile_function.deleteMany({
        where: {
          profile_id,
          transaction_id,
          function_id,
        },
      });
    } catch (error) {
      console.error('Erro ao deletar relação de função do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao deletar relação de função do perfil',
      );
    }
  }
}
