import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { BcryptService } from './auth/bcrypt.service';
import { FunctionsModule } from './functions/functions.module';
import { ModulesModule } from './modules/modules.module';
import { PrismaService } from './prisma/prisma.service';
import { ProfilesModule } from './profiles/profiles.module';
import { ProfilesService } from './profiles/profiles.service';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ProfilesModule,
    ModulesModule,
    TransactionsModule,
    FunctionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    AuthService,
    UsersService,
    ProfilesService,
    BcryptService,
  ],
})
export class AppModule {}
