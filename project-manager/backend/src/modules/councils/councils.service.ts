import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCouncilDto } from './dto/create-council.dto';
import { UpdateCouncilDto } from './dto/update-council.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CouncilQueryDto } from './dto/query-council.dto';

@Injectable()
export class CouncilsService {
  constructor(private prisma: PrismaService) { }
  async create(createCouncilDto: CreateCouncilDto, req: any) {
    const user = req.user;
    const faculty_id = user?.faculty_id;
    const { semester_id, rooms, buildings, name, start_date, end_date } = createCouncilDto
    const formattedStartDate = new Date(start_date.replace(' ', 'T'));
    const formattedEndDate = new Date(end_date.replace(' ', 'T'));
    const currentSemester = await this.prisma.semester.findUnique({
      where: {
        semester_id: BigInt(semester_id),
        start_date: { lte: new Date() },
        end_date: { gte: new Date() }
      }
    });

    if (!currentSemester) {
      throw new BadRequestException("Hiện tại không nằm trong thời gian của học kỳ được cấu hình!");
    }
    return await this.prisma.council.create({
      data: {
        buildings: buildings,
        faculty_id: BigInt(faculty_id),
        name: name,
        rooms: rooms,
        semester_id: BigInt(semester_id),
        start_date: formattedStartDate,
        end_date: formattedEndDate
      }
    });
  }

  async findAll(query: CouncilQueryDto, req: any) {
    const user = req.user;
    const faculty_id = user?.faculty_id;
    const where: any = {}
    if (faculty_id) where.faculty_id = BigInt(faculty_id)
    return await this.prisma.council.findMany({
      where,
      include: {
        faculty: true,
        members: {
          include: {
            lecturer: true
          }
        },
        semester: true
      }
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} council`;
  }

  async update(id: number, updateCouncilDto: UpdateCouncilDto) {
    const { semester_id, rooms, buildings, name, start_date, end_date } = updateCouncilDto
    const formattedStartDate = new Date(start_date!.replace(' ', 'T'));
    const formattedEndDate = new Date(end_date!.replace(' ', 'T'));
    const currentSemester = await this.prisma.semester.findUnique({
      where: {
        semester_id: BigInt(semester_id!),
        start_date: { lte: new Date() },
        end_date: { gte: new Date() }
      }
    });

    if (!currentSemester) {
      throw new BadRequestException("Hiện tại không nằm trong thời gian của học kỳ được cấu hình!");
    }
    return await this.prisma.council.update({
      where: {
        council_id: BigInt(id)
      },
      data: {
        buildings: buildings,
        name: name,
        rooms: rooms,
        semester_id: BigInt(semester_id!),
        start_date: formattedStartDate,
        end_date: formattedEndDate
      }
    })
  }

  async remove(id: number) {

    const council = await this.prisma.council.findUnique({
      where: {
        council_id: BigInt(id)
      },
      include: {
        capstones: true,
        members: true,
        council_evalution: true
      }
    })
    if (!council) {
      throw new BadRequestException("Hội đồng không tồn tại!");
    }
    if (council.capstones.length > 0 || council.members.length > 0 || council.council_evalution.length > 0) {
      throw new BadRequestException("Hội đồng đã được sử dụng, không thể xóa!");
    }
    return await this.prisma.council.delete({
      where: {
        council_id: BigInt(id)
      }
    })
  }
}
