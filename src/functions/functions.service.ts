import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFunctionDTO } from './dto/create-function.dto';

@Injectable()
export class FunctionsService {
  constructor(private prisma: PrismaService) {}

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
}
