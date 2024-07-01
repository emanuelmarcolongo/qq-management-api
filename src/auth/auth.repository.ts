import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}
  async getPasswordResetToken(token: string) {
    return await this.prisma.password_reset.findFirst({
      where: { token },
    });
  }

  async createPasswordRequest(
    email: string,
    token: string,
    expiration_date: Date,
  ) {
    return await this.prisma.password_reset.upsert({
      where: { email },
      update: {
        token,
        expiration_date,
      },
      create: {
        email,
        token,
        expiration_date,
      },
    });
  }
}
