import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProfileDTO,
  CreateProfileModuleDTO,
  CreateProfileTransactionDTO,
} from './dto/create-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}
  async existsById(id: number): Promise<Profile> {
    const profileExists = await this.prisma.profile.findFirst({
      where: { id },
    });
    if (!profileExists) throw new NotFoundException('Perfil não encontrado!');
    return profileExists;
  }

  async getProfiles(): Promise<Profile[]> {
    const profiles = await this.prisma.profile.findMany({
      where: {
        is_admin: false,
      },
    });

    return profiles;
  }

  async createProfile(profile: CreateProfileDTO) {
    const nameInUse = await this.prisma.profile.findFirst({
      where: { name: profile.name },
    });

    if (nameInUse)
      throw new ConflictException(
        `Perfil com o nome: ${profile.name} já existe`,
      );

    const newProfile = await this.prisma.profile.create({
      data: profile,
    });

    return newProfile;
  }

  async updateProfile(id: number, profile: CreateProfileDTO) {
    const profileExists = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o ${id} não foi encontrado!`);
    }

    const conflictingProfile = await this.prisma.profile.findFirst({
      where: {
        OR: [{ name: profile.name }],
        NOT: { id },
      },
    });

    if (conflictingProfile && conflictingProfile.name === profile.name) {
      throw new ConflictException(
        `Essa nome já pertence a outro perfil cadastrado`,
      );
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { id },
      data: {
        ...profile,
        updated_at: new Date(),
      },
    });
    return updatedProfile;
  }

  async deleteProfile(id: number) {
    const profileExists = await this.prisma.profile.findFirst({
      where: { id },
    });

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o ID:${id} dado não encontrado`);
    }

    const userWithProfile = await this.prisma.users.findFirst({
      where: {
        profile_id: id,
      },
    });

    if (userWithProfile) {
      throw new ConflictException(
        `Para deletar um perfil, certifique-se que não há usuários com o mesmo!`,
      );
    }

    const deletedProfile = await this.prisma.$transaction(async (prisma) => {
      await prisma.profile_function.deleteMany({
        where: {
          profile_id: id,
        },
      });

      await prisma.profile_transaction.deleteMany({
        where: {
          profile_id: id,
        },
      });

      await prisma.profile_module.deleteMany({
        where: {
          profile_id: id,
        },
      });

      return await prisma.profile.delete({
        where: { id },
      });
    });

    return deletedProfile;
  }

  async getProfileInfoById(profileId: number) {
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
        `Perfil com o ID:${profileId} dado não encontrado`,
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
  }

  async getAvailableTransactions(profile_id: number, module_id: number) {
    const profileExists = await this.prisma.profile.findUnique({
      where: { id: profile_id },
    });

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
    }

    const moduleRelation = await this.prisma.profile_module.findFirst({
      where: {
        module_id,
        profile_id,
      },
    });

    if (!moduleRelation) {
      throw new UnauthorizedException(
        'Módulo não vinculado ao perfil, vincule antes de vincular uma transação',
      );
    }

    const profileAvailableTransactions = await this.prisma.transaction.findMany(
      {
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
      },
    );

    return profileAvailableTransactions;
  }

  async getAvailableModules(profileId: number) {
    const profileExists = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
    }

    const profileAvailableModules = await this.prisma.module.findMany({
      where: {
        id: {
          notIn: (
            await this.prisma.profile_module.findMany({
              where: { profile_id: profileId },
              select: { module_id: true },
            })
          ).map((pm) => pm.module_id),
        },
      },
    });

    return profileAvailableModules;
  }

  async postProfileModule(profileId: number, body: CreateProfileModuleDTO) {
    const { moduleIds } = body;
    const profileExists = await this.prisma.profile.findUnique({
      where: {
        id: profileId,
      },
    });

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
    }

    const modulesExist = await this.prisma.module.findMany({
      where: {
        id: { in: moduleIds },
      },
    });

    if (modulesExist.length !== moduleIds.length) {
      throw new NotFoundException(
        `Um ou mais módulos com os Ids fornecidos não foram encontrados!`,
      );
    }

    const result = await this.prisma.$transaction(
      moduleIds.map((moduleId) =>
        this.prisma.profile_module.upsert({
          where: {
            profile_id_module_id: {
              profile_id: profileId,
              module_id: moduleId,
            },
          },
          update: {},
          create: {
            profile_id: profileId,
            module_id: moduleId,
          },
        }),
      ),
    );

    return result;
  }

  async deleteProfileModule(profile_id: number, module_id: number) {
    const profileModuleExists = await this.prisma.profile_module.findFirst({
      where: {
        profile_id,
        module_id,
      },
    });

    if (!profileModuleExists) {
      throw new NotFoundException(
        'Relação entre perfil e módulo não encontrada!',
      );
    }

    await this.prisma.$transaction(async (prisma) => {
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
          id: profileModuleExists.id,
        },
      });
    });
  }

  async postProfileTransaction(
    profileId: number,
    body: CreateProfileTransactionDTO,
  ) {
    const { transactionIds } = body;
    const profileExists = await this.prisma.profile.findUnique({
      where: {
        id: profileId,
      },
    });

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
    }

    const transactionsExists = await this.prisma.transaction.findMany({
      where: {
        id: { in: transactionIds },
      },
    });

    if (transactionsExists.length !== transactionIds.length) {
      throw new NotFoundException(
        `Um ou mais módulos com os Ids fornecidos não foram encontrados!`,
      );
    }

    const result = await this.prisma.$transaction(
      transactionIds.map((transaction_id) =>
        this.prisma.profile_transaction.upsert({
          where: {
            profile_id_transaction_id: {
              profile_id: profileId,
              transaction_id,
            },
          },
          update: {},
          create: {
            profile_id: profileId,
            transaction_id,
          },
        }),
      ),
    );

    return result;
  }

  async deleteProfileTransaction(profile_id: number, transaction_id: number) {
    const profileTransactionExists =
      await this.prisma.profile_transaction.findFirst({
        where: {
          profile_id,
          transaction_id,
        },
      });

    if (!profileTransactionExists) {
      throw new NotFoundException(
        'Relação entre perfil e transação não encontrada!',
      );
    }

    await this.prisma.$transaction(async (prisma) => {
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
  }
}
