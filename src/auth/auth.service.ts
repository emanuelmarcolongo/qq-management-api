import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { ProfilesService } from 'src/profiles/profiles.service';

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

    return this.usersService.createUser(user);
  }

  async signIn(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('Usuário não encontrado!');
    if (user?.password !== password) {
      throw new UnauthorizedException(
        'Credenciais incorretas, tente novamente',
      );
    }

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
