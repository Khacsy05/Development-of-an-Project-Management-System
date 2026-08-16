import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateFacultyDto {
    @IsString()
    @IsNotEmpty()
    faculty_code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    dean_id: string;
}
