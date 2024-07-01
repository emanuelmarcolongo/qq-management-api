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
import { errorHandler } from 'src/utils/ErrorHandler';
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
    try {
      return await this.usersRepository.getAllUsers();
    } catch (error) {
      errorHandler(error, 'Erro ao buscar todos os usuários');
    }
  }

  async findByUsername(username: string): Promise<Users | null> {
    try {
      return await this.usersRepository.findByUsername(username);
    } catch (error) {
      errorHandler(error, `Erro ao buscar usuário pelo username ${username}`);
    }
  }

  async getUserWithProfile(username: string): Promise<UserWithProfile | null> {
    try {
      return await this.usersRepository.getUserWithProfileByUsername(username);
    } catch (error) {
      errorHandler(
        error,
        `Erro ao buscar usuário com perfil pelo username ${username}`,
      );
    }
  }

  async getUserByEmail(email: string): Promise<Users | null> {
    try {
      return await this.usersRepository.getUserByEmail(email);
    } catch (error) {
      errorHandler(error, `Erro ao buscar usuário pelo email ${email}`);
    }
  }

  async register(user: CreateUserDTO) {
    try {
      if (user.registration.length !== 6) {
        throw new BadRequestException('A matrícula deve conter 6 caracteres');
      }

      const usernameInUse =
        await this.usersRepository.getUserWithProfileByUsername(user.username);
      if (usernameInUse) {
        throw new ConflictException(
          'Já existe um usuário com o nome de usuário',
        );
      }

      const emailInUse = await this.usersRepository.getUserByEmail(user.email);
      if (emailInUse) {
        throw new ConflictException('Já existe um usuário com o e-mail');
      }

      const registrationInUse =
        await this.usersRepository.getUserByRegistration(user.registration);
      if (registrationInUse) {
        throw new ConflictException('Já existe um usuário com a matrícula');
      }

      const profileExists = await this.profilesRepository.getProfileById(
        user.profile_id,
      );
      if (!profileExists) {
        throw new NotFoundException('Perfil não encontrado!');
      }

      const hashPassword = await this.bcrytService.hashPassword(
        user.registration,
      );

      return await this.usersRepository.createUser(user, hashPassword);
    } catch (error) {
      errorHandler(error, 'Erro ao registrar usuário');
    }
  }

  async updateUser(id: number, user: CreateUserDTO) {
    try {
      const userExists = await this.usersRepository.getUserById(id);

      if (!userExists) {
        throw new NotFoundException(`Usuário com o ID ${id} não encontrado!`);
      }

      const conflictingUser = await this.usersRepository.getConflictingUser(
        id,
        user,
      );

      if (conflictingUser) {
        if (conflictingUser.registration === user.registration) {
          throw new ConflictException(
            'Essa matrícula pertence a outro usuário',
          );
        }
        if (conflictingUser.username === user.username) {
          throw new ConflictException(
            'Esse nome de usuário pertence a outro usuário',
          );
        }
        if (conflictingUser.email === user.email) {
          throw new ConflictException('Esse email pertence a outro usuário');
        }
      }

      return await this.usersRepository.updateUser(id, user);
    } catch (error) {
      errorHandler(error, `Erro ao atualizar usuário com ID ${id}`);
    }
  }

  async deleteUser(id: number) {
    try {
      const userExists = await this.usersRepository.getUserById(id);

      if (!userExists) {
        throw new NotFoundException(`Usuário com o ID ${id} não encontrado`);
      }

      return await this.usersRepository.deleteUser(id);
    } catch (error) {
      errorHandler(error, `Erro ao deletar usuário com ID ${id}`);
    }
  }
}
