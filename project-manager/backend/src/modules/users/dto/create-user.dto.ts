import { IsNotEmpty, IsString, IsEmail } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    fullname: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    faculty_id: string;

    @IsString()
    @IsNotEmpty()
    gender: string;

    @IsString()
    @IsNotEmpty()
    phone_number: string;

    @IsString()
    @IsNotEmpty()
    class_id: string;

    @IsString()
    @IsNotEmpty()
    role_id: string;

    @IsString()
    @IsNotEmpty()
    usercode: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
