import { PartialType } from '@nestjs/mapped-types';
import { CreateCapstonesSubmissionDto } from './create-capstones-submission.dto';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { SubmissionStatus } from '@prisma/client';

export class UpdateCapstonesSubmissionDto extends PartialType(CreateCapstonesSubmissionDto) {
    @IsNotEmpty()
    @IsString()
    capstones_id!: string; // Chọn giảng viên hướng dẫn

    @IsNotEmpty()
    @IsString()
    milestone_id!: string;

    @IsOptional()
    @IsEnum(SubmissionStatus, { message: 'Trạng thái  không hợp lệ' })
    status?: SubmissionStatus;

    @IsOptional()
    @IsString()
    file_path?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Điểm số phải là số và tối đa 2 chữ số thập phân' })
    @Min(0, { message: 'Điểm số không được nhỏ hơn 0' })
    @Max(10, { message: 'Điểm số không được lớn hơn 10' })
    grade?: number;

    @IsOptional()
    @IsString()
    lecturer_note?: string;

    @IsOptional()
    @IsString()
    student_note?: string;
}
