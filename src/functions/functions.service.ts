import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFunctionDTO } from './dto/create-function.dto';
import { NotFoundError } from 'rxjs';

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

    await this.prisma.profile_function.deleteMany({
      where: { function_id: id },
    });

    const deletedFunction = await this.prisma.function.delete({
      where: { id },
    });

    return deletedFunction;
  }
}
