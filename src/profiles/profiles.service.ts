import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Profile } from '@prisma/client';
import { ModulesRepository } from 'src/modules/modules.repository';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
import { UsersRepository } from 'src/users/users.repository';
import { errorHandler } from 'src/utils/ErrorHandler';
import {
  CreateProfileDTO,
  CreateProfileModuleDTO,
  CreateProfileTransactionDTO,
} from './dto/create-profile.dto';
import { ProfilesRepository } from './profiles.repository';

@Injectable()
export class ProfilesService {
  constructor(
    private profilesRepository: ProfilesRepository,
    private usersRepository: UsersRepository,
    private modulesRepository: ModulesRepository,
    private transactionRepository: TransactionsRepository,
  ) {}
  async existsById(id: number): Promise<Profile> {
    try {
      const profileExists = await this.profilesRepository.getProfileById(id);
      if (!profileExists) throw new NotFoundException('Perfil não encontrado!');
      return profileExists;
    } catch (error) {
      errorHandler(error, 'Erro ao obter perfil  pelo ID');
    }
  }

  async getProfiles(): Promise<Profile[]> {
    try {
      const profiles = await this.profilesRepository.getProfiles();

      return profiles;
    } catch (error) {
      errorHandler(error, 'Erro ao obter perfis');
    }
  }

  async createProfile(profile: CreateProfileDTO) {
    try {
      const nameInUse = await this.profilesRepository.getProfileByName(
        profile.name,
      );

      if (nameInUse)
        throw new ConflictException(
          `Perfil com o nome: ${profile.name} já existe`,
        );

      return await this.profilesRepository.createProfile(profile);
    } catch (error) {
      errorHandler(error, 'Erro ao criar perfil');
    }
  }

  async updateProfile(id: number, profile: CreateProfileDTO) {
    try {
      const profileExists = await this.profilesRepository.getProfileById(id);

      if (!profileExists) {
        throw new NotFoundException(`Perfil com o ${id} não foi encontrado!`);
      }

      const conflictingProfile =
        await this.profilesRepository.getConflictingProfile(id, profile.name);

      if (conflictingProfile && conflictingProfile.name === profile.name) {
        throw new ConflictException(
          `Essa nome já pertence a outro perfil cadastrado`,
        );
      }

      return await this.profilesRepository.updateProfile(id, profile);
    } catch (error) {
      errorHandler(error, 'Erro ao atualizar perfil');
    }
  }

  async deleteProfile(id: number) {
    try {
      const profileExists = await this.profilesRepository.getProfileById(id);

      if (!profileExists) {
        throw new NotFoundException(
          `Perfil com o ID:${id} dado não encontrado`,
        );
      }

      const userWithProfile =
        await this.usersRepository.getUsersWithProfile(id);

      if (userWithProfile) {
        throw new ConflictException(
          `Para deletar um perfil, certifique-se que não há usuários com o mesmo!`,
        );
      }

      const deletedProfile = await this.profilesRepository.deleteProfile(id);

      return deletedProfile;
    } catch (error) {
      errorHandler(error, 'Erro ao deletar perfil');
    }
  }

  async getProfileInfoById(profileId: number) {
    try {
      const profile = this.profilesRepository.getProfileInfoById(profileId);

      return profile;
    } catch (error) {
      errorHandler(error, 'Erro ao pegar informações do perfil pelo ID');
    }
  }

  async getAvailableTransactions(profile_id: number, module_id: number) {
    try {
      const profileExists =
        await this.profilesRepository.getProfileById(profile_id);

      if (!profileExists) {
        throw new NotFoundException(
          `Perfil com o Id fornecido não encontrado!`,
        );
      }

      const moduleRelation = await this.profilesRepository.getModuleRelation(
        module_id,
        profile_id,
      );

      if (!moduleRelation) {
        throw new UnauthorizedException(
          'Módulo não vinculado ao perfil, vincule antes de vincular uma transação',
        );
      }

      const profileAvailableTransactions =
        await this.profilesRepository.getProfileAvailableTransactions(
          profile_id,
          module_id,
        );

      return profileAvailableTransactions;
    } catch (error) {
      errorHandler(error, 'Erro ao pegar funções disponíveis ao perfil');
    }
  }

  async getAvailableModules(profileId: number) {
    try {
      const profileExists =
        await this.profilesRepository.getProfileById(profileId);

      if (!profileExists) {
        throw new NotFoundException(
          `Perfil com o Id fornecido não encontrado!`,
        );
      }

      const profileAvailableModules =
        await this.profilesRepository.getProfileAvailableModules(profileId);

      return profileAvailableModules;
    } catch (error) {
      errorHandler(error, 'Erro ao pegar módulos disponíveis ao perfil');
    }
  }

  async postProfileModule(profileId: number, body: CreateProfileModuleDTO) {
    try {
      const { moduleIds } = body;
      const profileExists =
        await this.profilesRepository.getProfileById(profileId);

      if (!profileExists) {
        throw new NotFoundException(
          `Perfil com o Id fornecido não encontrado!`,
        );
      }

      const modulesExist =
        await this.modulesRepository.getManyModulesById(moduleIds);

      if (modulesExist.length !== moduleIds.length) {
        throw new NotFoundException(
          `Um ou mais módulos com os Ids fornecidos não foram encontrados!`,
        );
      }

      const result = await this.profilesRepository.createProfileModulesRelation(
        profileId,
        moduleIds,
      );

      return result;
    } catch (error) {
      errorHandler(error, 'Erro ao cadastrar permissão entre módulo e perfil');
    }
  }

  async deleteProfileModule(profile_id: number, module_id: number) {
    try {
      const profileModuleExists =
        await this.profilesRepository.getProfileModuleRelation(
          profile_id,
          module_id,
        );

      if (!profileModuleExists) {
        throw new NotFoundException(
          'Relação entre perfil e módulo não encontrada!',
        );
      }

      return await this.profilesRepository.deleteProfileModuleRelation(
        profile_id,
        module_id,
        profileModuleExists.id,
      );
    } catch (error) {
      errorHandler(error, 'Erro ao deletar permissão entre módulo e perfil');
    }
  }

  async postProfileTransaction(
    profileId: number,
    body: CreateProfileTransactionDTO,
  ) {
    try {
      const { transactionIds } = body;
      const profileExists =
        await this.profilesRepository.getProfileById(profileId);

      if (!profileExists) {
        throw new NotFoundException(
          `Perfil com o Id fornecido não encontrado!`,
        );
      }

      const transactionsExists =
        await this.transactionRepository.getManyTransactionsById(
          transactionIds,
        );

      if (transactionsExists.length !== transactionIds.length) {
        throw new NotFoundException(
          `Um ou mais transações com os Ids fornecidos não foram encontrados!`,
        );
      }

      return await this.profilesRepository.createProfileTransactionRelation(
        profileId,
        transactionIds,
      );
    } catch (error) {
      errorHandler(
        error,
        'Erro ao cadastrar permissão entre transação e perfil',
      );
    }
  }

  async deleteProfileTransaction(profile_id: number, transaction_id: number) {
    try {
      const profileTransactionExists =
        await this.profilesRepository.getProfileTransactionRelation(
          profile_id,
          transaction_id,
        );

      if (!profileTransactionExists) {
        throw new NotFoundException(
          'Relação entre perfil e transação não encontrada!',
        );
      }

      return await this.profilesRepository.deleteProfileTransactionRelation(
        profile_id,
        transaction_id,
      );
    } catch (error) {
      errorHandler(error, 'Erro ao deletar permissão entre transação e perfil');
    }
  }
}
