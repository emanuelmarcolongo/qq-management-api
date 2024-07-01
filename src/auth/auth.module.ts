import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ModulesRepository } from 'src/modules/modules.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesRepository } from 'src/profiles/profiles.repository';
import { ProfilesService } from 'src/profiles/profiles.service';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { BcryptService } from './bcrypt.service';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7 days' },
    }),
  ],
  providers: [
    AuthService,
    UsersService,
    PrismaService,
    ProfilesService,
    BcryptService,
    ProfilesRepository,
    UsersRepository,
    ModulesRepository,
    TransactionsRepository,
    UsersRepository,
    AuthRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
