import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProfileDTO,
  CreateProfileModuleDTO,
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
    const deletedProfile = await this.prisma.profile.delete({
      where: { id },
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

    return {
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
        this.prisma.profile_module.create({
          data: {
            profile_id: profileId,
            module_id: moduleId,
          },
        }),
      ),
    );

    return result;
  }
}
