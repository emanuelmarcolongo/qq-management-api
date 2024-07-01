import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users } from '@prisma/client';
import { BcryptService } from 'src/auth/bcrypt.service';
import { UserWithProfile } from 'src/models/UserModels';
import { ProfilesRepository } from 'src/profiles/profiles.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private bcrytService: BcryptService,
    private usersRepository: UsersRepository,
    private profilesRepository: ProfilesRepository,
  ) {}

  async getAllUsers(): Promise<Users[] | null> {
    return await this.usersRepository.getAllUsers();
  }

  async findByUsername(username: string): Promise<Users | null> {
    return await this.usersRepository.findByUsername(username);
  }

  async getUserWithProfile(username: string): Promise<UserWithProfile | null> {
    return await this.usersRepository.getUserWithProfileByUsername(username);
  }

  async getUserByEmail(email: string): Promise<Users | null> {
    return this.usersRepository.getUserByEmail(email);
  }

  async register(user: CreateUserDTO) {
    if (user.registration.length !== 6)
      throw new BadRequestException('A matrícula deve conter 6 caracteres');
    const usernameInUse =
      await this.usersRepository.getUserWithProfileByUsername(user.username);
    if (usernameInUse)
      throw new ConflictException(
        'Já existe um usuário com o e-mail ou nome de usuário',
      );

    const emailInUse = await this.usersRepository.getUserByEmail(user.email);
    if (emailInUse)
      throw new ConflictException(
        'Já existe um usuário com o e-mail ou nome de usuário',
      );

    const registrationInUse = await this.usersRepository.getUserByRegistration(
      user.registration,
    );

    if (registrationInUse)
      throw new ConflictException('Já existe um usuário com a matrícula');

    const profileExists = await this.profilesRepository.getProfileById(
      user.profile_id,
    );
    if (!profileExists) throw new NotFoundException('Perfil não encontrado!');

    const hashPassword = await this.bcrytService.hashPassword(
      user.registration,
    );

    return await this.usersRepository.createUser(user, hashPassword);
  }

  async updateUser(id: number, user: CreateUserDTO) {
    const userExists = await this.usersRepository.getUserById(id);

    if (!userExists) {
      throw new NotFoundException(`Usuário com o ${id} não encontrado!`);
    }

    const conflictingUser = await this.usersRepository.getConflictingUser(
      id,
      user,
    );

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

    return await this.usersRepository.updateUser(id, user);
  }

  async deleteUser(id: number) {
    const userExists = await this.usersRepository.getUserById(id);

    if (!userExists) {
      throw new NotFoundException(`Usuário com o ID:${id} dado não encontrado`);
    }

    return await this.usersRepository.deleteUser(id);
  }
}
