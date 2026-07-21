import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export enum CouncilPosition {
    CHAIRMAN = 'CHAIRMAN',   // Chủ tịch
    SECRETARY = 'SECRETARY', // Thư ký
    MEMBER = 'MEMBER',       // Ủy viên
}

export class CouncilMemberItemDto {
    @IsNotEmpty()
    lecturer_id!: string;

    @IsEnum(CouncilPosition, { message: 'Chức vụ không hợp lệ' })
    position!: CouncilPosition;
}

export class CreateCouncilsMemberDto {
    @IsNotEmpty()
    council_id!: string;

    @IsArray()
    @ValidateNested({ each: true }) // Validation từng element trong mảng
    @Type(() => CouncilMemberItemDto)
    members!: CouncilMemberItemDto[]
}
