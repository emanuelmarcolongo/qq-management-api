import { IsInt, IsString, IsUrl, Length } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsUrl()
  email: string;

  @IsString()
  @Length(6)
  registration: string;

  @IsInt()
  profile_id: number;
}
