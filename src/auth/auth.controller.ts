import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDTO } from './dto/auth-login.dto';
import {
  PasswordResetDTO,
  RequestPasswordResetDTO,
} from './dto/password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: AuthLoginDTO) {
    return this.authService.signIn(body.username, body.password);
  }

  @Post('request-password-reset')
  async RequestPasswordReset(@Body() body: RequestPasswordResetDTO) {
    try {
      return this.authService.requestPasswordReset(body.email);
    } catch (error) {
      return new InternalServerErrorException(
        'Algo deu errado, tente novamente!',
      );
    }
  }

  @Get('validate-token/:token')
  async validatePasswordResetToken(@Param('token') token: string) {
    return this.authService.validateToken(token);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: PasswordResetDTO) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
