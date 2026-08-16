import { Injectable } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FacultiesService {

  constructor(private prisma: PrismaService) { }

  async create(createFacultyDto: CreateFacultyDto) {
    const { faculty_code, name, dean_id } = createFacultyDto;
    return await this.prisma.faculty.create({
      data: {
        faculty_code: faculty_code,
        name: name,
        dean_id: dean_id ? BigInt(dean_id) : null,
      }
    });
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
      include: {
        dean: true,
      }
    });
  }


  async findOne(id: number) {
    return await this.prisma.faculty.findUnique({
      where: {
        faculty_id: BigInt(id),
      },
    });
  }

  async findMajors(facultyId: number) {
    return await this.prisma.major.findMany({
      where: {
        faculty_id: BigInt(facultyId),
      },
    });
  }

  async update(id: number, updateFacultyDto: UpdateFacultyDto) {
    const { name, dean_id } = updateFacultyDto;
    return await this.prisma.faculty.update({
      where: {
        faculty_id: BigInt(id),
      },
      data: {
        name: name ? name : undefined,
        dean_id: dean_id !== undefined ? (dean_id ? BigInt(dean_id) : null) : undefined,
      }
    });
  }
}
