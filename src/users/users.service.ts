import { Injectable } from '@nestjs/common';
import { Users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<Users[] | null> {
    return await this.prisma.users.findMany();
  }

  async findByUsername(username: string): Promise<Users | null> {
    return await this.prisma.users.findUnique({
      where: {
        username,
      },
    });
  }

  async getUserByEmail(email: string): Promise<Users | null> {
    return await this.prisma.users.findUnique({
      where: {
        email,
      },
    });
  }

  async createUser(user: CreateUserDTO) {
    return await this.prisma.users.create({
      data: user,
    });
  }
}
