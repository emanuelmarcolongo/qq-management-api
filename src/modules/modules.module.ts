import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesRepository } from 'src/profiles/profiles.repository';
import { UsersRepository } from 'src/users/users.repository';
import { ModulesController } from './modules.controller';
import { ModulesRepository } from './modules.repository';
import { ModulesService } from './modules.service';

@Module({
  providers: [
    ModulesService,
    PrismaService,
    ModulesRepository,
    UsersRepository,
    ProfilesRepository,
  ],
  controllers: [ModulesController],
})
export class ModulesModule {}
