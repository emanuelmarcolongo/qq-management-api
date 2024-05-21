import { Injectable } from '@nestjs/common';
import { Prisma, Users } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async getUsers(): Promise<Users[]> {
    const users = await this.prisma.users.findMany();

    return users;
  }
}
