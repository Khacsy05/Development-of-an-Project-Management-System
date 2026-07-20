import { PartialType } from '@nestjs/mapped-types';
import { CreateCouncilEvalutionDto } from './create-council-evalution.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateCouncilEvalutionDto extends PartialType(CreateCouncilEvalutionDto) {
    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Điểm số phải là số và tối đa 2 chữ số thập phân' })
    @Min(0, { message: 'Điểm số không được nhỏ hơn 0' })
    @Max(10, { message: 'Điểm số không được lớn hơn 10' })
    grade?: number;

    @IsNotEmpty()
    @IsString()
    lecturer_note?: string;

}
