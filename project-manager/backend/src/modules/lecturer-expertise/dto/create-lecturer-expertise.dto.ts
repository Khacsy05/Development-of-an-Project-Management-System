import { IsArray, IsString } from "class-validator";

export class SaveLecturerExpertiseDto {
    @IsArray()
    @IsString({ each: true })
    expertise_ids: string[];
}
