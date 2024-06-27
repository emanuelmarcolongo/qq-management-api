import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserSignInInfo } from 'src/models/UserModels';
import { ProfilesService } from 'src/profiles/profiles.service';
import { UsersService } from '../users/users.service';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BcryptService } from './bcrypt.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private profileService: ProfilesService,
    private prisma: PrismaService,
    private bcryptService: BcryptService,
  ) {}

  async register(user: AuthRegisterDTO) {
    const userExists = await this.usersService.getUserByEmail(user.email);
    if (userExists)
      throw new ConflictException(
        'Já existe um usuário com o e-mail ou nome de usuário',
      );

    const profileExists = await this.profileService.existsById(user.profile_id);
    if (!profileExists) throw new NotFoundException('Perfil não encontrado!');

    return this.usersService.register(user);
  }

  async signIn(
    username: string,
    password: string,
  ): Promise<{ access_token: string; userInfo: UserSignInInfo }> {
    const user = await this.usersService.getUserWithProfile(username);
    if (!user) throw new NotFoundException('Usuário não encontrado!');

    const isValidPassword = await this.bcryptService.comparePasswords(
      password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException(
        'Credenciais incorretas, tente novamente',
      );
    }

    const payload = {
      sub: user.id,
      username: user.username,
      profile: user.profile.name,
      is_admin: user.profile.is_admin,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      userInfo: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        registration: user.registration,
        profile: user.profile.name,
        is_admin: user.profile.is_admin,
      },
    };
  }

  async requestPasswordReset(email: string) {
    const userExists = await this.prisma.users.findFirst({
      where: { email },
    });

    if (!userExists) {
      throw new NotFoundException('Usuário com o Email dado não encontrado!');
    }

    const token = crypto.randomUUID().replaceAll('-', '');
    const expiration_date = new Date(Date.now() + 10 * 60 * 1000);

    const passwordRequest = await this.prisma.password_reset.upsert({
      where: { email },
      update: {
        token,
        expiration_date,
      },
      create: {
        email,
        token,
        expiration_date,
      },
    });

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        token,
      }),
    };

    try {
      const response = await fetch(
        `${process.env.EMAIL_API_URL}/reset-password/`,
        fetchOptions,
      );

      if (!response.ok) {
        throw new Error('Falha ao enviar e-mail via Fast API');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error('Falha ao enviar e-mail via Fast API');
    }

    return { message: 'Redefinição de senha solicitada com sucesso!' };
  }

  async validateToken(token: string) {
    const tokenExists = await this.prisma.password_reset.findFirst({
      where: { token },
    });

    if (!tokenExists) {
      throw new BadRequestException('Token inválido ou expirado!');
    }
    const currentTime = new Date();
    if (currentTime > tokenExists.expiration_date) {
      throw new BadRequestException('Token inválido ou expirado!');
    }

    return tokenExists;
  }

  async resetPassword(token: string, password: string) {
    const isValidToken = await this.validateToken(token);

    if (!isValidToken) {
      throw new BadRequestException('Token inválido ou expirado!');
    }

    const hashPassword = await this.bcryptService.hashPassword(password);

    const updatedUser = await this.prisma.users.update({
      where: { email: isValidToken.email },
      data: { password: hashPassword },
    });

    return { message: 'Senha modificada com sucesso!' };
  }
}
