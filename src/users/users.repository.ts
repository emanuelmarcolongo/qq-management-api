import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Users } from '@prisma/client';
import { UserWithProfile } from 'src/models/UserModels';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<Users[] | null> {
    try {
      return await this.prisma.users.findMany({
        include: {
          profile: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      throw new InternalServerErrorException(
        'Erro ao buscar todos os usuários',
      );
    }
  }

  async getUserById(id: number) {
    try {
      return await this.prisma.users.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error(`Erro ao buscar usuário pelo ID ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar usuário pelo ID ${id}`,
      );
    }
  }

  async getUserByEmail(email: string): Promise<Users | null> {
    try {
      return await this.prisma.users.findUnique({
        where: {
          email,
        },
      });
    } catch (error) {
      console.error(`Erro ao buscar usuário pelo e-mail ${email}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar usuário pelo e-mail ${email}`,
      );
    }
  }

  async getUsersWithProfile(profile_id: number) {
    try {
      return await this.prisma.users.findFirst({
        where: {
          profile_id,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar usuário pelo ID do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao buscar usuário pelo ID do perfil',
      );
    }
  }

  async getUserByRegistration(registration: string) {
    try {
      return await this.prisma.users.findFirst({
        where: { registration },
      });
    } catch (error) {
      console.error(
        `Erro ao buscar usuário pela matrícula ${registration}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Erro ao buscar usuário pela matrícula ${registration}`,
      );
    }
  }

  async getUserWithProfileByUsername(
    username: string,
  ): Promise<UserWithProfile | null> {
    try {
      return await this.prisma.users.findUnique({
        where: {
          username,
        },
        include: {
          profile: true,
        },
      });
    } catch (error) {
      console.error(`Erro ao buscar usuário pelo username ${username}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar usuário pelo username ${username}`,
      );
    }
  }

  async findByUsername(username: string): Promise<Users | null> {
    try {
      return await this.prisma.users.findUnique({
        where: {
          username,
        },
      });
    } catch (error) {
      console.error(`Erro ao buscar usuário pelo username ${username}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar usuário pelo username ${username}`,
      );
    }
  }

  async createUser(user: CreateUserDTO, hashPassword: string) {
    try {
      return await this.prisma.users.create({
        data: { ...user, password: hashPassword },
      });
    } catch (error) {
      console.error('Erro ao criar novo usuário:', error);
      throw new InternalServerErrorException('Erro ao criar novo usuário');
    }
  }

  async getConflictingUser(id: number, user: CreateUserDTO) {
    try {
      return await this.prisma.users.findFirst({
        where: {
          OR: [
            { registration: user.registration },
            { username: user.username },
            { email: user.email },
          ],
          NOT: { id },
        },
      });
    } catch (error) {
      console.error('Erro ao verificar usuário conflitante:', error);
      throw new InternalServerErrorException(
        'Erro ao verificar usuário conflitante',
      );
    }
  }

  async updateUser(id: number, user: CreateUserDTO) {
    try {
      return await this.prisma.users.update({
        where: { id },
        data: {
          ...user,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao atualizar usuário com ID ${id}`,
      );
    }
  }

  async deleteUser(id: number) {
    try {
      return await this.prisma.users.delete({
        where: { id },
      });
    } catch (error) {
      console.error(`Erro ao deletar usuário com ID ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao deletar usuário com ID ${id}`,
      );
    }
  }

  async updateUserPassword(email: string, hashPassword: string) {
    try {
      return await this.prisma.users.update({
        where: { email },
        data: { password: hashPassword },
      });
    } catch (error) {
      console.error(
        `Erro ao atualizar senha do usuário com email ${email}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Erro ao atualizar senha do usuário com email ${email}`,
      );
    }
  }
}
