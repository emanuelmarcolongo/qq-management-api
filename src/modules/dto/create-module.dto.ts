import { IsOptional, IsString } from 'class-validator';

export class CreateModuleDTO {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  text_color: string;

  @IsString()
  background_color: string;
}
