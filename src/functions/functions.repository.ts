import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFunctionDTO } from './dto/create-function.dto';

@Injectable()
export class FunctionsRepository {
  constructor(private prisma: PrismaService) {}
  async getAllFunctions() {
    const functions = await this.prisma.function.findMany({
      include: {
        module: true,
      },
    });

    return functions;
  }

  async getFunctionByName(name: string, module_id: number) {
    return await this.prisma.function.findFirst({
      where: { name, module_id },
    });
  }

  async createFunction(func: CreateFunctionDTO) {
    return await this.prisma.function.create({
      data: func,
    });
  }

  async updateFunction(id: number, func: CreateFunctionDTO) {
    return await this.prisma.function.update({
      where: { id },
      data: { ...func, updated_at: new Date() },
    });
  }

  async getFunctionById(id: number) {
    return await this.prisma.function.findUnique({
      where: { id },
    });
  }

  async deleteFunction(id: number) {
    return await this.prisma.$transaction(async (prisma) => {
      await prisma.profile_function.deleteMany({
        where: { function_id: id },
      });

      return await prisma.function.delete({
        where: { id },
      });
    });
  }

  async getProfileAvailableFunctions(
    profile_id: number,
    transaction_id: number,
    module_id: number,
  ) {
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
  }

  async getManyFunctionsById(functionIds: number[]) {
    return await this.prisma.function.findMany({
      where: {
        id: { in: functionIds },
      },
    });
  }

  async createProfileFunctionRelation(
    functionIds: number[],
    profile_id: number,
    transaction_id: number,
  ) {
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
  }
}
