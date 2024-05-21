import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Users } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<Users[] | null> {
    return await this.appService.getUsers();
  }
}
