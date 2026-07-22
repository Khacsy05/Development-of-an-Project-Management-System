import { IsDateString, IsNotEmpty, IsString } from "class-validator";

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

    @IsNotEmpty({ message: 'Vui lòng chọn thời gian bắt đầu' })
    @IsDateString({}, { message: 'start_date phải đúng định dạng ISO Date (YYYY-MM-DDTHH:mm:ssZ)' })
    start_date!: string;

    @IsNotEmpty({ message: 'Vui lòng chọn thời gian kết thúc' })
    @IsDateString({}, { message: 'end_date phải đúng định dạng ISO Date (YYYY-MM-DDTHH:mm:ssZ)' })
    end_date!: string;
}
