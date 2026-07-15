import { Injectable } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FacultiesService {

  constructor(private prisma: PrismaService) {}

  create(createFacultyDto: CreateFacultyDto) {
    return 'This action adds a new faculty';
  }

  async findAll(faculty_code?: string, name?: string) {

    return await this.prisma.faculty.findMany({
      where: {
        faculty_code: faculty_code ? faculty_code : undefined,
        name: name ? {
          contains: name
        } : undefined
      },
      orderBy: {
        created_at: 'desc', // Hoặc trường sắp xếp tùy thuộc vào schema của bạn
      },
    });
  }
  

   async findOne(id: number) {
    return await this.prisma.faculty.findUnique({
      where: {
        faculty_id: id,
      },
    });
  }

  update(id: number, updateFacultyDto: UpdateFacultyDto) {
    return `This action updates a #${id} faculty`;
  }

  remove(id: number) {
    return `This action removes a #${id} faculty`;
  }
}
