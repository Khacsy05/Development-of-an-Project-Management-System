import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouncilsMemberDto } from './dto/create-councils-member.dto';
import { UpdateCouncilsMemberDto } from './dto/update-councils-member.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CouncilMemberQuery } from './dto/query-council-member.dto';
import { CouncilPosition } from '@prisma/client';

@Injectable()
export class CouncilsMembersService {
  constructor(private prisma: PrismaService) { }
  async create(createCouncilsMemberDto: CreateCouncilsMemberDto, req: any) {
    const {
      council_id,
      members
    } = createCouncilsMemberDto
    const user = req.user as any
    const councilBigInt = BigInt(council_id)
    const isExisCouncil = await this.prisma.council.findUnique({
      where: { council_id: councilBigInt },
      include: { faculty: true }
    })

    const payloadChairmanCount = members.filter(m => m.position === CouncilPosition.CHAIRMAN).length;
    const payloadSecretaryCount = members.filter(m => m.position === CouncilPosition.SECRETARY).length


    if (payloadChairmanCount !== 1) {
      throw new BadRequestException('Hội đồng phải có duy nhất 1 Chủ tịch');
    }
    if (payloadSecretaryCount !== 1) {
      throw new BadRequestException('Hội đồng phải có duy nhất 1 Thư ký');
    }


    if (!isExisCouncil) {
      throw new NotFoundException('Không tìm thấy hội đồng chấm thi');
    }

    if (String(user.id) !== String(isExisCouncil.faculty?.dean_id)) {
      throw new BadRequestException('Bạn không có quyền được chỉnh sửa');
    }
    const lecturerBigInts = members.map((m) => BigInt(m.lecturer_id));

    const existingLecturers = await this.prisma.user.findMany({
      where: {
        user_id: { in: lecturerBigInts },
      }
    })


    for (let member of members) {
      const lecturerIdBigInt = BigInt(member.lecturer_id);
      const foundLecturer = existingLecturers.find((u) => u.user_id === lecturerIdBigInt);
      // Kiểm tra tồn tại
      if (!foundLecturer) {
        throw new BadRequestException(`Giảng viên có ID ${member.lecturer_id} không tồn tại`);
      }
      if (foundLecturer.faculty_id !== isExisCouncil.faculty_id) {
        throw new BadRequestException(`Giảng viên ${foundLecturer.fullname} không thuộc khoa của hội đồng`);
      }


    }

    const dataToInsert = members.map((item) => ({
      council_id: councilBigInt,
      lecturer_id: BigInt(item.lecturer_id),
      position: item.position,
    }));

    await this.prisma.councilMember.deleteMany({
      where: { council_id: councilBigInt }
    });

    await this.prisma.councilMember.createMany({
      data: dataToInsert,
    });

    return {
      message: `Đã cập nhật thành công thành viên cho hội đồng`,
    };

  }

  async findAll(params: CouncilMemberQuery) {
    const { lecturer_id, council_id, page, limit } = params
    const pageNumber = Math.max(1, Number(page) || 1)
    const limitNumber = Math.max(1, Number(limit) || 6)
    const skip = (pageNumber - 1) * limitNumber
    const where: any = {}
    if (lecturer_id) where.lecturer_id = BigInt(lecturer_id)
    if (council_id) where.council_id = BigInt(council_id)

    const [data, total] = await this.prisma.$transaction([
      this.prisma.councilMember.findMany({
        where,
        skip,
        take: limitNumber,
        include: {
          council: true,
          lecturer: true
        },
        orderBy: {
          position: 'asc'
        }
      }),
      this.prisma.councilMember.count({ where })
    ])

    return {
      data: data,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} councilsMember`;
  }

  update(id: number, updateCouncilsMemberDto: UpdateCouncilsMemberDto) {
    return `This action updates a #${id} councilsMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} councilsMember`;
  }
}
