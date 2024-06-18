import {
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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private profileService: ProfilesService,
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
    if (user?.password !== password) {
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
}
