import { IsNotEmpty, IsString } from "class-validator";

export class CreateMajorDto {
    @IsString()
    @IsNotEmpty()
    major_name: string;

    @IsString()
    @IsNotEmpty()
    faculty_id: string;
}
