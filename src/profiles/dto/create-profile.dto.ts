import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProfileDTO {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}

export class CreateProfileModuleDTO {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  moduleIds: number[];
}

export class DeleteProfileModuleDTO {
  @IsInt()
  moduleId: number;
}
