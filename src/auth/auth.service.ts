import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserSignInInfo } from 'src/models/UserModels';
import { ProfilesRepository } from 'src/profiles/profiles.repository';
import { CreateUserDTO } from 'src/users/dto/create-user.dto';
import { UsersRepository } from 'src/users/users.repository';
import { AuthRepository } from './auth.repository';
import { BcryptService } from './bcrypt.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private usersRepository: UsersRepository,
    private profilesRepository: ProfilesRepository,
    private authRepository: AuthRepository,
  ) {}

  async register(user: CreateUserDTO) {
    if (user.registration.length !== 6)
      throw new BadRequestException('A matrícula deve conter 6 caracteres');
    const usernameInUse =
      await this.usersRepository.getUserWithProfileByUsername(user.username);
    if (usernameInUse)
      throw new ConflictException(
        'Já existe um usuário com o e-mail ou nome de usuário',
      );

    const emailInUse = await this.usersRepository.getUserByEmail(user.email);
    if (emailInUse)
      throw new ConflictException(
        'Já existe um usuário com o e-mail ou nome de usuário',
      );

    const registrationInUse = await this.usersRepository.getUserByRegistration(
      user.registration,
    );

    if (registrationInUse)
      throw new ConflictException('Já existe um usuário com a matrícula');

    const profileExists = await this.profilesRepository.getProfileById(
      user.profile_id,
    );
    if (!profileExists) throw new NotFoundException('Perfil não encontrado!');

    const hashPassword = await this.bcryptService.hashPassword(
      user.registration,
    );

    return await this.usersRepository.createUser(user, hashPassword);
  }

  async signIn(
    username: string,
    password: string,
  ): Promise<{ access_token: string; userInfo: UserSignInInfo }> {
    const user =
      await this.usersRepository.getUserWithProfileByUsername(username);
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
    const userExists = await this.usersRepository.getUserByEmail(email);

    if (!userExists) {
      throw new NotFoundException(
        'Usuário com o email fornecido não encontrado!',
      );
    }

    const token = crypto.randomUUID().replaceAll('-', '');
    const expiration_date = new Date(Date.now() + 10 * 60 * 1000);

    const passwordRequest = await this.authRepository.createPasswordRequest(
      email,
      token,
      expiration_date,
    );

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
        throw new InternalServerErrorException(
          'Falha no envio de e-mail, fale com o responsável do sistema',
        );
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw new InternalServerErrorException(
        'Falha no envio de e-mail, fale com o responsável do sistema',
      );
    }

    return { message: 'Redefinição de senha solicitada com sucesso!' };
  }

  async validateToken(token: string) {
    const tokenExists = await this.authRepository.getPasswordResetToken(token);

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

    const updatedUser = await this.usersRepository.updateUserPassword(
      isValidToken.email,
      hashPassword,
    );

    return { message: 'Senha modificada com sucesso!' };
  }
}
