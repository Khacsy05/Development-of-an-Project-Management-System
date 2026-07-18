import { PartialType } from '@nestjs/mapped-types';
import { CreateCapstoneDto } from './create-capstone.dto';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CapstoneStatus } from '@prisma/client';


export class UpdateCapstoneDto extends PartialType(CreateCapstoneDto) {
    @IsOptional()
    @IsString()
    lecturer_id?: string; // Chọn giảng viên hướng dẫn

    @IsOptional()
    @IsString()
    topic_id?: string;

    @IsOptional()
    @IsEnum(CapstoneStatus, { message: 'Trạng thái đồ án không hợp lệ' })
    status?: CapstoneStatus;

    @IsOptional()
    @IsString()
    final_report_path?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Điểm số phải là số và tối đa 2 chữ số thập phân' })
    @Min(0, { message: 'Điểm số không được nhỏ hơn 0' })
    @Max(10, { message: 'Điểm số không được lớn hơn 10' })
    instructor_grade?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Điểm số phải là số và tối đa 2 chữ số thập phân' })
    @Min(0, { message: 'Điểm số không được nhỏ hơn 0' })
    @Max(10, { message: 'Điểm số không được lớn hơn 10' })
    council_grade?: number;

    @IsOptional()
    @IsString()
    council_id?: string;

    @IsOptional()
    @IsInt({ message: 'Thứ tự bảo vệ phải là số nguyên' })
    @Min(1, { message: 'Thứ tự bảo vệ tối thiểu là 1' })
    defense_order?: number;

    @IsOptional()
    @IsString()
    message?: string;
}
