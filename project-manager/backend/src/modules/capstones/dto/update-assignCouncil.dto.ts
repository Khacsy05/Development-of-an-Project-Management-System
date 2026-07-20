import { IsNotEmpty, IsString } from "class-validator";

export class AssignCouncilDto {
    @IsNotEmpty()
    @IsString()
    council_id!: string;
}