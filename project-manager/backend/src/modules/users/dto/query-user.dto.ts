import { Type } from "class-transformer";

export class UserQueryDto{
    role? : string;
    fullname? : string;
    @Type(() => Number)
    page? :number;
    @Type(() => Number)
    limit? : number;
}