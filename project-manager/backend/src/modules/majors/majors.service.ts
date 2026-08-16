import { Injectable } from '@nestjs/common';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MajorsService {
  constructor(private prisma: PrismaService) { }

  async create(createMajorDto: CreateMajorDto) {
    const { major_name, faculty_id } = createMajorDto;
    return await this.prisma.major.create({
      data: {
        major_name,
        faculty_id: BigInt(faculty_id),
      },
    });
  }

  async findAll() {
    return await this.prisma.major.findMany({
      include: {
        faculty: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.major.findUnique({
      where: {
        major_id: BigInt(id),
      },
      include: {
        faculty: true,
      },
    });
  }

  async update(id: number, updateMajorDto: UpdateMajorDto) {
    const { major_name, faculty_id } = updateMajorDto;
    return await this.prisma.major.update({
      where: {
        major_id: BigInt(id),
      },
      data: {
        major_name: major_name ? major_name : undefined,
        faculty_id: faculty_id ? BigInt(faculty_id) : undefined,
      },
    });
  }
}
