import { Injectable } from '@nestjs/common';
import { SaveLecturerExpertiseDto } from './dto/create-lecturer-expertise.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LecturerExpertiseService {
  constructor(private prisma: PrismaService) { }

  async findMyExpertises(lecturerId: number) {
    const list = await this.prisma.lecturerExpertise.findMany({
      where: {
        lecturer_id: BigInt(lecturerId),
      },
      include: {
        expertise: true,
      },
    });
    return list.map(item => item.expertise);
  }

  async saveMyExpertises(lecturerId: number, dto: SaveLecturerExpertiseDto) {
    const { expertise_ids } = dto;
    const lecIdBigInt = BigInt(lecturerId);

    return await this.prisma.$transaction(async (tx) => {
      // 1. Xóa toàn bộ chuyên môn cũ của giảng viên này
      await tx.lecturerExpertise.deleteMany({
        where: {
          lecturer_id: lecIdBigInt,
        },
      });

      // 2. Tạo các liên kết mới
      if (expertise_ids && expertise_ids.length > 0) {
        const createData = expertise_ids.map((expId) => ({
          lecturer_id: lecIdBigInt,
          expertise_id: BigInt(expId),
        }));

        await tx.lecturerExpertise.createMany({
          data: createData,
        });
      }

      // 3. Trả về danh sách chuyên môn mới cập nhật
      const updated = await tx.lecturerExpertise.findMany({
        where: {
          lecturer_id: lecIdBigInt,
        },
        include: {
          expertise: true,
        },
      });
      return updated.map(item => item.expertise);
    });
  }
}
