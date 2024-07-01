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
    const profileExists = await this.profilesRepository.getProfileById(id);
    if (!profileExists) throw new NotFoundException('Perfil não encontrado!');
    return profileExists;
  }

  async getProfiles(): Promise<Profile[]> {
    const profiles = await this.profilesRepository.getProfiles();

    return profiles;
  }

  async createProfile(profile: CreateProfileDTO) {
    const nameInUse = await this.profilesRepository.getProfileByName(
      profile.name,
    );

    if (nameInUse)
      throw new ConflictException(
        `Perfil com o nome: ${profile.name} já existe`,
      );

    return await this.profilesRepository.createProfile(profile);
  }

  async updateProfile(id: number, profile: CreateProfileDTO) {
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
  }

  async deleteProfile(id: number) {
    const profileExists = await this.profilesRepository.getProfileById(id);

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o ID:${id} dado não encontrado`);
    }

    const userWithProfile = await this.usersRepository.getUsersWithProfile(id);

    if (userWithProfile) {
      throw new ConflictException(
        `Para deletar um perfil, certifique-se que não há usuários com o mesmo!`,
      );
    }

    const deletedProfile = await this.profilesRepository.deleteProfile(id);

    return deletedProfile;
  }

  async getProfileInfoById(profileId: number) {
    const profile = this.profilesRepository.getProfileInfoById(profileId);

    return profile;
  }

  async getAvailableTransactions(profile_id: number, module_id: number) {
    const profileExists =
      await this.profilesRepository.getProfileById(profile_id);

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
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
  }

  async getAvailableModules(profileId: number) {
    const profileExists =
      await this.profilesRepository.getProfileById(profileId);

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
    }

    const profileAvailableModules =
      await this.profilesRepository.getProfileAvailableModules(profileId);

    return profileAvailableModules;
  }

  async postProfileModule(profileId: number, body: CreateProfileModuleDTO) {
    const { moduleIds } = body;
    const profileExists =
      await this.profilesRepository.getProfileById(profileId);

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
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
  }

  async deleteProfileModule(profile_id: number, module_id: number) {
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
  }

  async postProfileTransaction(
    profileId: number,
    body: CreateProfileTransactionDTO,
  ) {
    const { transactionIds } = body;
    const profileExists =
      await this.profilesRepository.getProfileById(profileId);

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
    }

    const transactionsExists =
      await this.transactionRepository.getManyTransactionsById(transactionIds);

    if (transactionsExists.length !== transactionIds.length) {
      throw new NotFoundException(
        `Um ou mais transações com os Ids fornecidos não foram encontrados!`,
      );
    }

    return await this.profilesRepository.createProfileTransactionRelation(
      profileId,
      transactionIds,
    );
  }

  async deleteProfileTransaction(profile_id: number, transaction_id: number) {
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
  }
}
