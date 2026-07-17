import { PartialType } from '@nestjs/mapped-types';
import { CreateCapstonesRequestDto } from './create-capstones-request.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CapstoneStatus, RequestStatus } from '@prisma/client';

export class UpdateCapstonesRequestDto extends PartialType(CreateCapstonesRequestDto) {
    @IsOptional()
    @IsString()
    feedback? : string
    
    @IsEnum(RequestStatus, { message: 'Trạng thái đồ án không hợp lệ' })
    status!: RequestStatus;
}
