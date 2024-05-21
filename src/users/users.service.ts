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
}
