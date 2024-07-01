import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfileDTO } from './dto/create-profile.dto';

@Injectable()
export class ProfilesRepository {
  constructor(private prisma: PrismaService) {}

  async findProfileWithProfileModules(profile_id: number) {
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
  }

  async getProfileById(id: number) {
    return await this.prisma.profile.findFirst({
      where: { id },
    });
  }

  async getProfileByName(name: string) {
    return await this.prisma.profile.findFirst({
      where: { name },
    });
  }

  async getProfiles(): Promise<Profile[]> {
    const profiles = await this.prisma.profile.findMany();

    return profiles;
  }

  async createProfile(profile: CreateProfileDTO) {
    return await this.prisma.profile.create({
      data: profile,
    });
  }

  async getConflictingProfile(id: number, name: string) {
    return await this.prisma.profile.findFirst({
      where: {
        OR: [{ name }],
        NOT: { id },
      },
    });
  }

  async updateProfile(id: number, profile: CreateProfileDTO) {
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
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
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

  async getModuleRelation(module_id: number, profile_id: number) {
    return await this.prisma.profile_module.findFirst({
      where: {
        module_id,
        profile_id,
      },
    });
  }

  async getProfileAvailableTransactions(profile_id: number, module_id: number) {
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
  }

  async getProfileAvailableModules(profile_id: number) {
    const profileAvailableModules = await this.prisma.module.findMany({
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

    return profileAvailableModules;
  }

  async getProfileModuleRelation(profile_id: number, module_id: number) {
    return await this.prisma.profile_module.findFirst({
      where: {
        profile_id,
        module_id,
      },
    });
  }

  async createProfileModulesRelation(profile_id: number, moduleIds: number[]) {
    const result = await this.prisma.$transaction(
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

    return result;
  }

  async deleteProfileModuleRelation(
    profile_id: number,
    module_id: number,
    profile_module_id: number,
  ) {
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
  }

  async createProfileTransactionRelation(
    profile_id: number,
    transactionIds: number[],
  ) {
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
  }

  async getProfileTransactionRelation(
    profile_id: number,
    transaction_id: number,
  ) {
    return await this.prisma.profile_transaction.findFirst({
      where: {
        profile_id,
        transaction_id,
      },
    });
  }

  async deleteProfileTransactionRelation(
    profile_id: number,
    transaction_id: number,
  ) {
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
  }

  async getProfileFunctionRelation(profile_id: number, function_id: number) {
    return await this.prisma.profile_function.findFirst({
      where: {
        profile_id,
        function_id,
      },
    });
  }

  async deleteProfileFunctionRelation(
    profile_id: number,
    transaction_id: number,
    function_id: number,
  ) {
    return await this.prisma.profile_function.deleteMany({
      where: {
        profile_id,
        transaction_id,
        function_id,
      },
    });
  }
}
