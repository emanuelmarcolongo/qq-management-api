import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
