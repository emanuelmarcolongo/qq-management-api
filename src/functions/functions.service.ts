import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesRepository } from 'src/profiles/profiles.repository';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
import {
  CreateFunctionDTO,
  CreateProfileFunctionDTO,
} from './dto/create-function.dto';
import { FunctionsRepository } from './functions.repository';

@Injectable()
export class FunctionsService {
  constructor(
    private prisma: PrismaService,
    private functionsRepository: FunctionsRepository,
    private profilesRepository: ProfilesRepository,
    private transactionRepository: TransactionsRepository,
  ) {}

  async getAllFunctions() {
    const functions = await this.functionsRepository.getAllFunctions();

    return functions;
  }

  async createFunction(func: CreateFunctionDTO) {
    const nameInUse = await this.functionsRepository.getFunctionByName(
      func.name,
      func.module_id,
    );

    if (nameInUse) {
      throw new ConflictException(
        `Função com o nome: ${func.name} já existe nesse módulo`,
      );
    }

    return await this.functionsRepository.createFunction(func);
  }

  async updateFunction(id: number, func: CreateFunctionDTO) {
    const nameInUse = await this.functionsRepository.getFunctionByName(
      func.name,
      func.module_id,
    );

    if (nameInUse && nameInUse.id !== id) {
      throw new ConflictException(
        `Outra função com o nome: ${func.name} já existe nesse módulo`,
      );
    }

    return await this.functionsRepository.updateFunction(id, func);
  }

  async deleteFunction(id: number) {
    const functionExists = await this.functionsRepository.getFunctionById(id);

    if (!functionExists) {
      throw new NotFoundException(`Função com o id: ${id} não encontrada`);
    }

    const deletedFunction = await this.functionsRepository.deleteFunction(id);

    return deletedFunction;
  }

  async getAvailableFunctions(profile_id: number, transaction_id: number) {
    const profileExists =
      await this.profilesRepository.getProfileById(profile_id);

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
    }
    const transactionExist =
      await this.transactionRepository.getTransactionById(transaction_id);

    if (!transactionExist) {
      throw new NotFoundException(
        `Transação com o Id fornecido não encontrada!`,
      );
    }

    const transactionRelation =
      await this.profilesRepository.getProfileTransactionRelation(
        profile_id,
        transaction_id,
      );

    if (!transactionRelation) {
      throw new UnauthorizedException(
        'Transação não vinculada ao perfil, vincule antes de vincular uma função',
      );
    }

    const profileAvailableFunctions =
      await this.functionsRepository.getProfileAvailableFunctions(
        profile_id,
        transaction_id,
        transactionExist.module_id,
      );

    return profileAvailableFunctions;
  }

  async deleteProfileFunction(
    profile_id: number,
    function_id: number,
    transaction_id: number,
  ) {
    const profileFunctionExists =
      await this.profilesRepository.getProfileFunctionRelation(
        profile_id,
        function_id,
      );

    if (!profileFunctionExists) {
      throw new NotFoundException(
        'Relação entre perfil e função não encontrada!',
      );
    }

    return await this.profilesRepository.deleteProfileFunctionRelation(
      profile_id,
      transaction_id,
      function_id,
    );
  }

  async postProfileFunction(
    profile_id: number,
    transaction_id: number,
    body: CreateProfileFunctionDTO,
  ) {
    const { functionIds } = body;
    const profileExists =
      await this.profilesRepository.getProfileById(profile_id);

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
    }

    const functionsExists =
      await this.functionsRepository.getManyFunctionsById(functionIds);

    if (functionsExists.length !== functionIds.length) {
      throw new NotFoundException(
        `Um ou mais funções com os Ids fornecidos não foram encontradas!`,
      );
    }

    const result = await this.functionsRepository.createProfileFunctionRelation(
      functionIds,
      profile_id,
      transaction_id,
    );

    return result;
  }
}
