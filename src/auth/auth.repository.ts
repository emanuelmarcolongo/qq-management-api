import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { errorHandler } from 'src/utils/ErrorHandler';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async getPasswordResetToken(token: string) {
    try {
      return await this.prisma.password_reset.findFirst({
        where: { token },
      });
    } catch (error) {
      console.error('Erro ao obter o token de redefinição de senha:', error);
      throw new InternalServerErrorException(
        'Erro ao obter o token de redefinição de senha',
      );
    }
  }

  async createPasswordRequest(
    email: string,
    token: string,
    expiration_date: Date,
  ) {
    try {
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
    } catch (error) {
      errorHandler(error, 'Erro ao criar solicitação de redefinição de senha');
    }
  }
}
