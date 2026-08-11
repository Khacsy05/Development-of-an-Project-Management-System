import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty()
  @IsString()
  class_name: string;

  @IsNotEmpty()
  @IsNumber()
  major_id: number;

  @IsOptional()
  @IsNumber()
  faculty_id?: number;

  @IsNotEmpty()
  @IsNumber()
  lecturer_id: number;
}
