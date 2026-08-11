import { Injectable } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ClassQueryDto } from './dto/query-class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) { }
  async create(createClassDto: CreateClassDto, req: any) {
    const { class_name, major_id, lecturer_id } = createClassDto;
    const faculty_id = req.user.faculty_id;
    return await this.prisma.class.create({
      data: {
        class_name,
        major_id: BigInt(major_id),
        faculty_id: faculty_id ? BigInt(faculty_id) : null,
        lecturer_id: BigInt(lecturer_id),
      }
    });
  }

  async findAll(query: ClassQueryDto) {
    const { class_name, page, limit, faculty_id } = query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 6);
    const skip = (pageNumber - 1) * limitNumber;
    const classNameNormalized = class_name?.trim();
    const where = {
      faculty_id: faculty_id ? Number(faculty_id) : undefined,
      class_name: class_name ? {
        contains: classNameNormalized
      } : undefined
    };
    const [classes, total] = await this.prisma.$transaction([
      this.prisma.class.findMany({
        where,
        skip,
        take: limitNumber,
        include: {
          major: true,
          lecturer: true,
        },
        orderBy: [
          {
            created_at: 'desc',
          },
          {
            class_id: "desc"
          }
        ]
      }),
      this.prisma.class.count({ where })
    ]);

    return {
      data: classes,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async findOne(id: number) {
    return await this.prisma.class.findUnique({
      where: {
        class_id: BigInt(id),
      },
      include: {
        major: true,
        lecturer: true,
      }
    });
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    const { class_name, major_id, faculty_id, lecturer_id } = updateClassDto;
    return await this.prisma.class.update({
      where: {
        class_id: BigInt(id),
      },
      data: {
        class_name: class_name ? class_name : undefined,
        major_id: major_id ? BigInt(major_id) : undefined,
        faculty_id: faculty_id ? BigInt(faculty_id) : undefined,
        lecturer_id: lecturer_id ? BigInt(lecturer_id) : undefined,
      }
    });
  }

  async remove(id: number) {
    return await this.prisma.class.delete({
      where: {
        class_id: BigInt(id),
      }
    });
  }
}
