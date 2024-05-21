import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Users } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDTO } from './dto/create-user.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  async getUsers(): Promise<Users[] | null> {
    const users = await this.usersService.getAllUsers();
    return users;
  }

  @Post('register')
  async register(@Body() body: CreateUserDTO) {
    return this.usersService.register(body);
  }
}
