import { IsNotEmpty, IsString } from "class-validator";

export class CreateCouncilDto {
    @IsNotEmpty()
    @IsString()
    buildings!: string; 

    @IsNotEmpty()
    @IsString()
    faculty_id!: string;

    @IsNotEmpty()
    @IsString()
    semester_id!: string;

    @IsNotEmpty()
    @IsString()
    name!: string; 

    @IsNotEmpty()
    @IsString()
    rooms!: string; 

     
}
