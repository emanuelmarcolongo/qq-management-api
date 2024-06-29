import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: number) {
    return await this.prisma.users.findUnique({
      where: {
        id,
      },
    });
  }
}
