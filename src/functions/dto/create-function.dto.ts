import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFunctionDTO {
  @IsString()
  name: string;

  @IsNumber()
  module_id: number;

  @IsString()
  @IsOptional()
  description: string;
}
