import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { ProfilesService } from 'src/profiles/profiles.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private profileService: ProfilesService,
  ) {}

  async getAllUsers(): Promise<Users[] | null> {
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
  }

  async findByUsername(username: string): Promise<Users | null> {
    return await this.prisma.users.findUnique({
      where: {
        username,
      },
    });
  }

  async getUserByEmail(email: string): Promise<Users | null> {
    return await this.prisma.users.findUnique({
      where: {
        email,
      },
    });
  }

  async register(user: CreateUserDTO) {
    if (user.registration.length !== 6)
      throw new BadRequestException('A matrícula deve conter 6 caracteres');
    const usernameInUse = await this.prisma.users.findFirst({
      where: { username: user.username },
    });
    if (usernameInUse)
      throw new ConflictException(
        'Já existe um usuário com o e-mail ou nome de usuário',
      );

    const emailInUse = await this.prisma.users.findFirst({
      where: { email: user.email },
    });
    if (emailInUse)
      throw new ConflictException(
        'Já existe um usuário com o e-mail ou nome de usuário',
      );

    const registrationInUse = await this.prisma.users.findFirst({
      where: { registration: user.registration },
    });

    if (registrationInUse)
      throw new ConflictException('Já existe um usuário com a matrícula');

    const profileExists = await this.profileService.existsById(user.profile_id);
    if (!profileExists) throw new NotFoundException('Perfil não encontrado!');

    return this.prisma.users.create({ data: user });
  }

  async createUser(user: CreateUserDTO) {
    return await this.prisma.users.create({
      data: user,
    });
  }

  async updateUser(id: number, user: CreateUserDTO) {
    const userExists = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!userExists) {
      throw new NotFoundException(`Usuário com o ${id} não encontrado!`);
    }

    const conflictingUser = await this.prisma.users.findFirst({
      where: {
        OR: [
          { registration: user.registration },
          { username: user.username },
          { email: user.email },
        ],
        NOT: { id },
      },
    });

    if (conflictingUser) {
      if (conflictingUser.registration === user.registration) {
        throw new ConflictException(`Essa matrícula pertence a outro usuário`);
      }
      if (conflictingUser.username === user.username) {
        throw new ConflictException(
          `Esse nome de usuário pertence a outro usuário`,
        );
      }
      if (conflictingUser.email === user.email) {
        throw new ConflictException(`Esse email pertence a outro usuário`);
      }
    }

    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: {
        ...user,
        updated_at: new Date(),
      },
    });
    return updatedUser;
  }

  async deleteUser(id: number) {
    const userExists = await this.prisma.users.findFirst({
      where: { id },
    });

    if (!userExists) {
      throw new NotFoundException(`Usuário com o ID:${id} dado não encontrado`);
    }
    const deletedUser = await this.prisma.users.delete({
      where: { id },
    });

    return deletedUser;
  }
}
