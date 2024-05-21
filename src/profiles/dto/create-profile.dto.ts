import { IsOptional, IsString } from 'class-validator';

export class CreateProfileDTO {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}
