import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

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
}
