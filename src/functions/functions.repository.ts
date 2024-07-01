import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFunctionDTO } from './dto/create-function.dto';

@Injectable()
export class FunctionsRepository {
  constructor(private prisma: PrismaService) {}

  async getAllFunctions() {
    try {
      const functions = await this.prisma.function.findMany({
        include: {
          module: true,
        },
      });

      return functions;
    } catch (error) {
      console.error('Erro ao obter todas as funções:', error);
      throw new InternalServerErrorException('Erro ao obter todas as funções');
    }
  }

  async getFunctionByName(name: string, module_id: number) {
    try {
      return await this.prisma.function.findFirst({
        where: { name, module_id },
      });
    } catch (error) {
      console.error('Erro ao obter função pelo nome:', error);
      throw new InternalServerErrorException('Erro ao obter função pelo nome');
    }
  }

  async createFunction(func: CreateFunctionDTO) {
    try {
      return await this.prisma.function.create({
        data: func,
      });
    } catch (error) {
      console.error('Erro ao criar função:', error);
      throw new InternalServerErrorException('Erro ao criar função');
    }
  }

  async updateFunction(id: number, func: CreateFunctionDTO) {
    try {
      return await this.prisma.function.update({
        where: { id },
        data: { ...func, updated_at: new Date() },
      });
    } catch (error) {
      console.error('Erro ao atualizar função:', error);
      throw new InternalServerErrorException('Erro ao atualizar função');
    }
  }

  async getFunctionById(id: number) {
    try {
      return await this.prisma.function.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Erro ao obter função pelo ID:', error);
      throw new InternalServerErrorException('Erro ao obter função pelo ID');
    }
  }

  async deleteFunction(id: number) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.profile_function.deleteMany({
          where: { function_id: id },
        });

        return await prisma.function.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.error('Erro ao deletar função:', error);
      throw new InternalServerErrorException('Erro ao deletar função');
    }
  }

  async getProfileAvailableFunctions(
    profile_id: number,
    transaction_id: number,
    module_id: number,
  ) {
    try {
      const profileAvailableFunctions = await this.prisma.function.findMany({
        where: {
          id: {
            notIn: (
              await this.prisma.profile_function.findMany({
                where: { profile_id, transaction_id },
                select: { function_id: true },
              })
            ).map((func) => func.function_id),
          },
          module_id,
        },
      });

      return profileAvailableFunctions;
    } catch (error) {
      console.error('Erro ao obter funções disponíveis para o perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao obter funções disponíveis para o perfil',
      );
    }
  }

  async getManyFunctionsById(functionIds: number[]) {
    try {
      return await this.prisma.function.findMany({
        where: {
          id: { in: functionIds },
        },
      });
    } catch (error) {
      console.error('Erro ao obter múltiplas funções pelo ID:', error);
      throw new InternalServerErrorException(
        'Erro ao obter múltiplas funções pelo ID',
      );
    }
  }

  async createProfileFunctionRelation(
    functionIds: number[],
    profile_id: number,
    transaction_id: number,
  ) {
    try {
      return await this.prisma.$transaction(
        functionIds.map((function_id) =>
          this.prisma.profile_function.upsert({
            where: {
              profile_id_transaction_id_function_id: {
                profile_id: profile_id,
                transaction_id: transaction_id,
                function_id,
              },
            },
            update: {},
            create: {
              profile_id,
              transaction_id,
              function_id,
            },
          }),
        ),
      );
    } catch (error) {
      console.error('Erro ao criar relação de função do perfil:', error);
      throw new InternalServerErrorException(
        'Erro ao criar relação de função do perfil',
      );
    }
  }
}
