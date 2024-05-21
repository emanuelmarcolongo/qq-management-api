import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { ProfilesModule } from './profiles/profiles.module';
import { ProfilesService } from './profiles/profiles.service';

@Module({
  imports: [UsersModule, AuthModule, ProfilesModule],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    AuthService,
    UsersService,
    ProfilesService,
  ],
})
export class AppModule {}
