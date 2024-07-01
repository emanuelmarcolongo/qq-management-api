import { Injectable } from '@nestjs/common';
import { Users } from '@prisma/client';
import { UserWithProfile } from 'src/models/UserModels';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<Users[] | null> {
    return await this.prisma.users.findMany({
      include: {
        profile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getUserById(id: number) {
    return await this.prisma.users.findUnique({
      where: {
        id,
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

  async getUsersWithProfile(profile_id: number) {
    return await this.prisma.users.findFirst({
      where: {
        profile_id,
      },
    });
  }

  async getUserByRegistration(registration: string) {
    return await this.prisma.users.findFirst({
      where: { registration },
    });
  }

  async getUserWithProfileByUsername(
    username: string,
  ): Promise<UserWithProfile | null> {
    return await this.prisma.users.findUnique({
      where: {
        username,
      },
      include: {
        profile: true,
      },
    });
  }

  async findByUsername(username: string): Promise<Users | null> {
    return await this.prisma.users.findUnique({
      where: {
        username,
      },
    });
  }

  async createUser(user: CreateUserDTO, hashPassword: string) {
    return await this.prisma.users.create({
      data: { ...user, password: hashPassword },
    });
  }

  async getConflictingUser(id: number, user: CreateUserDTO) {
    return await this.prisma.users.findFirst({
      where: {
        OR: [
          { registration: user.registration },
          { username: user.username },
          { email: user.email },
        ],
        NOT: { id },
      },
    });
  }

  async updateUser(id: number, user: CreateUserDTO) {
    return await this.prisma.users.update({
      where: { id },
      data: {
        ...user,
        updated_at: new Date(),
      },
    });
  }

  async deleteUser(id: number) {
    return await this.prisma.users.delete({
      where: { id },
    });
  }

  async updateUserPassword(email: string, hashPassword: string) {
    return await this.prisma.users.update({
      where: { email },
      data: { password: hashPassword },
    });
  }
}
