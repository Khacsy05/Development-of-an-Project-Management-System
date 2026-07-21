import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouncilsMemberDto } from './dto/create-councils-member.dto';
import { UpdateCouncilsMemberDto } from './dto/update-councils-member.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouncilsMembersService {
  constructor(private prisma : PrismaService){}
  async create(createCouncilsMemberDto: CreateCouncilsMemberDto,req: any) {
    const {
      council_id,
      members
    } = createCouncilsMemberDto
    const user = req.user as any
    const councilBigInt = BigInt(council_id) 
    const isExisCouncil = await this.prisma.council.findUnique({
      where: {council_id: councilBigInt},
      include: {faculty: true}
    })

    if(!isExisCouncil) {
      throw new NotFoundException('Không tìm thấy hội đồng chấm thi');
    }

    if(String(user.id) !== String(isExisCouncil.faculty?.dean_id)){
      throw new BadRequestException('Bạn không có quyền được chỉnh sửa');
    }
    const lecturerBigInts = members.map((m) => BigInt(m.lecturer_id));

    const existingLecturers = await this.prisma.user.findMany({
      where: {
        user_id: { in: lecturerBigInts },
        role_id: 2, // Đảm bảo đúng role Giảng viên
        faculty_id: isExisCouncil.faculty?.faculty_id
      },
      select: { user_id: true },
    })

    if (existingLecturers.length !== members.length) {
      throw new BadRequestException('Có giảng viên không tồn tại hoặc không hợp lệ');
    }
    const dataToInsert = members.map((item) => ({
      council_id: councilBigInt,
      lecturer_id: BigInt(item.lecturer_id),
      position: item.position,
    }));

    await this.prisma.councilMember.createMany({
      data: dataToInsert,
      skipDuplicates: true, // Tránh crash nếu giảng viên đó đã có trong hội đồng từ trước
    });
      
    return {
      message: `Đã thêm thành công ${lecturerBigInts.length} thành viên vào hội đồng`,
    };

  }

  findAll() {
    return `This action returns all councilsMembers`;
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
