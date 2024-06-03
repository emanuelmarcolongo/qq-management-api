import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDTO {
  @IsString()
  name: string;

  @IsNumber()
  module_id: number;

  @IsString()
  @IsOptional()
  description: string;
}
