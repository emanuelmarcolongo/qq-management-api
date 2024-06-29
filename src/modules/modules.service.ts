import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Module } from '@prisma/client';
import { PayloadUserInfo } from 'src/models/UserModels';
import { ProfilesRepository } from 'src/profiles/profiles.repository';
import { UsersRepository } from 'src/users/users.repository';
import { CreateModuleDTO } from './dto/create-module.dto';
import { ModulesRepository } from './modules.repository';

@Injectable()
export class ModulesService {
  constructor(
    private modulesRepository: ModulesRepository,
    private usersRepository: UsersRepository,
    private profilesRepository: ProfilesRepository,
  ) {}

  async getModules(): Promise<Module[]> {
    return await this.modulesRepository.getModules();
  }

  async getModuleById(moduleId: number) {
    return await this.modulesRepository.getModuleById(moduleId);
  }

  async createModule(module: CreateModuleDTO) {
    const nameInUse = await this.modulesRepository.getModuleByName(module.name);

    if (nameInUse) {
      throw new ConflictException(
        `Módulo com o nome: ${module.name} já existe`,
      );
    }

    const newModule = await this.modulesRepository.createModule(module);

    return newModule;
  }

  async updateModule(id: number, module: CreateModuleDTO) {
    const moduleExists = await this.modulesRepository.getModuleById(id);

    if (!moduleExists) {
      throw new NotFoundException(`Módulo com o id: ${id} não encontrado`);
    }

    const nameInUse = await this.modulesRepository.getModuleByName(module.name);

    if (nameInUse && nameInUse.id !== id) {
      throw new ConflictException(
        `Já existe um diferente módulo com esse nome, tente outro nome`,
      );
    }

    const updatedModule = await this.modulesRepository.updateModule(id, module);

    return updatedModule;
  }

  async deleteModule(id: number) {
    const moduleExists = await this.modulesRepository.getModuleById(id);

    if (!moduleExists) {
      throw new NotFoundException(`Módulo com o ID dado não encontrado`);
    }

    return await this.modulesRepository.deleteModule(id);
  }

  async getUserModules(user: PayloadUserInfo) {
    const userExists = await this.usersRepository.getUserById(user.sub);
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    const { profile_id } = userExists;

    const profileWithModules =
      await this.profilesRepository.findProfileWithProfileModules(profile_id);

    if (!profileWithModules) {
      throw new Error('Perfil não encontrado');
    }

    return profileWithModules.profile_modules.map((pm) => ({
      id: pm.module.id,
      name: pm.module.name,
      description: pm.module.description,
      text_color: pm.module.text_color,
      background_color: pm.module.background_color,
      created_at: pm.module.updated_at,
      updated_at: pm.module.created_at,
    }));
  }

  async getUserModuleById(module_id: number, user: PayloadUserInfo) {
    const userExists = await this.usersRepository.getUserById(user.sub);

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    const { profile_id } = userExists;

    const module = await this.modulesRepository.getUserModuleWithDetail(
      module_id,
      profile_id,
    );

    if (!module) {
      throw new NotFoundException('Módulo não encontrado para este perfil');
    }

    return {
      id: module.id,
      name: module.name,
      description: module.description,
      transactions: module.transactions
        .filter((t) =>
          t.profile_transactions.some((pt) => pt.profile_id === profile_id),
        )
        .map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          functions: t.profile_transactions
            .flatMap((pt) => pt.transaction.profile_function)
            .filter((pf) => pf.profile_id === profile_id)
            .map((pf) => ({
              id: pf.function.id,
              name: pf.function.name,
              description: pf.function.description,
            })),
        })),
    };
  }
}
