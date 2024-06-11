import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFunctionDTO {
  @IsString()
  name: string;

  @IsNumber()
  module_id: number;

  @IsString()
  @IsOptional()
  description: string;
}

export class CreateProfileFunctionDTO {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  functionIds: number[];
}
