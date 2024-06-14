import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateFunctionDTO,
  CreateProfileFunctionDTO,
} from './dto/create-function.dto';

@Injectable()
export class FunctionsService {
  constructor(private prisma: PrismaService) {}

  async getAllFunctions() {
    const functions = await this.prisma.function.findMany({
      include: {
        module: true,
      },
    });

    return functions;
  }

  async createFunction(func: CreateFunctionDTO) {
    const nameInUse = await this.prisma.function.findFirst({
      where: { name: func.name, module_id: func.module_id },
    });

    if (nameInUse) {
      throw new ConflictException(
        `Função com o nome: ${func.name} já existe nesse módulo`,
      );
    }

    const newFunction = await this.prisma.function.create({
      data: func,
    });

    return newFunction;
  }

  async updateFunction(id: number, func: CreateFunctionDTO) {
    const nameInUse = await this.prisma.function.findFirst({
      where: { name: func.name, module_id: func.module_id },
    });

    if (nameInUse && nameInUse.id !== id) {
      throw new ConflictException(
        `Outra função com o nome: ${func.name} já existe nesse módulo`,
      );
    }

    const updatedFunction = await this.prisma.function.update({
      where: { id },
      data: { ...func, updated_at: new Date() },
    });

    return updatedFunction;
  }

  async deleteFunction(id: number) {
    const functionExists = await this.prisma.function.findUnique({
      where: { id },
    });

    if (!functionExists) {
      throw new NotFoundException(`Função com o id: ${id} não encontrada`);
    }

    const deletedFunction = await this.prisma.$transaction(async (prisma) => {
      await prisma.profile_function.deleteMany({
        where: { function_id: id },
      });

      return await prisma.function.delete({
        where: { id },
      });
    });

    return deletedFunction;
  }

  async getAvailableFunctions(profile_id: number, transaction_id: number) {
    const profileExists = await this.prisma.profile.findUnique({
      where: { id: profile_id },
    });

    const transactionExist = await this.prisma.transaction.findUnique({
      where: { id: transaction_id },
    });

    if (!transactionExist) {
      throw new NotFoundException(
        `Transação com o Id fornecido não encontrada!`,
      );
    }

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
    }

    const transactionRelation = await this.prisma.profile_transaction.findFirst(
      {
        where: {
          transaction_id,
          profile_id,
        },
      },
    );

    if (!transactionRelation) {
      throw new UnauthorizedException(
        'Transação não vinculada ao perfil, vincule antes de vincular uma transação',
      );
    }

    const profileAvailableFunctions = await this.prisma.function.findMany({
      where: {
        id: {
          notIn: (
            await this.prisma.profile_function.findMany({
              where: { profile_id, transaction_id },
              select: { function_id: true },
            })
          ).map((pm) => pm.function_id),
        },
        module_id: transactionExist.module_id,
      },
    });

    return profileAvailableFunctions;
  }

  async deleteProfileFunction(
    profile_id: number,
    function_id: number,
    transaction_id: number,
  ) {
    const profileFunctionExists = await this.prisma.profile_function.findFirst({
      where: {
        profile_id,
        function_id,
      },
    });

    if (!profileFunctionExists) {
      throw new NotFoundException(
        'Relação entre perfil e função não encontrada!',
      );
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.profile_function.deleteMany({
        where: {
          profile_id,
          transaction_id,
          function_id,
        },
      });
    });
  }

  async postProfileFunction(
    profile_id: number,
    transaction_id: number,
    body: CreateProfileFunctionDTO,
  ) {
    const { functionIds } = body;
    const profileExists = await this.prisma.profile.findUnique({
      where: {
        id: profile_id,
      },
    });

    if (!profileExists) {
      throw new NotFoundException(`Perfil com o Id fornecido não encontrado!`);
    }

    const functionsExists = await this.prisma.function.findMany({
      where: {
        id: { in: functionIds },
      },
    });

    if (functionsExists.length !== functionsExists.length) {
      throw new NotFoundException(
        `Um ou mais funções com os Ids fornecidos não foram encontradas!`,
      );
    }

    const result = await this.prisma.$transaction(
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

    return result;
  }
}
