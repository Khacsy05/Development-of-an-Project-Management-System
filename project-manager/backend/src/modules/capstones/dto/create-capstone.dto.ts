import { CapstoneStatus } from "@prisma/client"
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCapstoneDto {
    // 1. Mã sinh viên (Bắt buộc như chúng ta vừa thống nhất)
  @IsNotEmpty({ message: 'Mã số sinh viên không được để trống' })
  @IsString()
  student_id!: string; 
}
