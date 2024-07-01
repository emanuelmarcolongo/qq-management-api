import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Users } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';

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

  @Put(':id')
  async updateModule(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateUserDTO,
  ) {
    const updatedUser = await this.usersService.updateUser(id, body);

    return updatedUser;
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const deletedUser = await this.usersService.deleteUser(id);

    return deletedUser;
  }
}
