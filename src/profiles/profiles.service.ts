import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfileDTO } from './dto/create-profile.dto';

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
}
