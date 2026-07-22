import { IsBoolean, IsEmpty, IsOptional, IsString } from "class-validator";

export class CreateTopicDto {
    @IsEmpty()
    @IsString()
    expertise_id!: string;

    @IsEmpty()
    @IsString()
    faculty_id!: string;

    @IsEmpty()
    @IsString()
    technologies!: string;

    @IsEmpty()
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;


}
