import { IsString } from 'class-validator';

export class RequestPasswordResetDTO {
  @IsString()
  email: string;
}

export class PasswordResetDTO {
  @IsString()
  token: string;
  @IsString()
  password: string;
}
