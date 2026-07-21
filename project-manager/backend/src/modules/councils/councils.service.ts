import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCouncilDto } from './dto/create-council.dto';
import { UpdateCouncilDto } from './dto/update-council.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouncilsService {
  constructor(private prisma: PrismaService) {}
  async create(createCouncilDto: CreateCouncilDto) {
    const {semester_id,rooms,buildings,faculty_id,name} = createCouncilDto
    const currentSemester = await this.prisma.semester.findUnique({
      where: {
        semester_id: BigInt(semester_id),
        start_date: { lte: new Date() },
        end_date: { gte: new Date() }
      }
    });
        
    if(!currentSemester) {
      throw new BadRequestException("Hiện tại không nằm trong thời gian của học kỳ được cấu hình!");
    }
    return await this.prisma.council.create({
      data: {
        buildings: buildings,
        faculty_id: BigInt(faculty_id),
        name: name,
        rooms: rooms,
        semester_id: BigInt(semester_id),
      }
    });
  }

  findAll() {
    return `This action returns all councils`;
  }

  findOne(id: number) {
    return `This action returns a #${id} council`;
  }

  update(id: number, updateCouncilDto: UpdateCouncilDto) {
    return `This action updates a #${id} council`;
  }

  remove(id: number) {
    return `This action removes a #${id} council`;
  }
}
