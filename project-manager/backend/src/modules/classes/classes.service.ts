import { Injectable } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ClassQueryDto } from './dto/query-class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}
  create(createClassDto: CreateClassDto) {
    return 'This action adds a new class';
  }

  async findAll(query : ClassQueryDto) {
    const {class_name, page,limit} = query
    const pageNumber = Math.max(1,Number(page) || 1)
    const limitNumber = Math.max(1,Number(limit) || 6)
    const skip = (pageNumber-1) * limitNumber
    const classNameNormalized = class_name?.trim()
    const where = {
      class_name: class_name ?{
          contains: classNameNormalized
        } : undefined
    }
    const [classes,total] = await this.prisma.$transaction([
      this.prisma.class.findMany({
        where,
        skip,
        take:limitNumber,
        orderBy: [
          {
            created_at: 'desc',
          },
          {
            class_id : "desc"
          }
        ]
      }),
      this.prisma.class.count({where})
    ])

    return{
      
        data: classes,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
      
    }
  }

  async findOne(id: number) {
    return await this.prisma.class.findUnique({
      where: {
        class_id: id,
      },
    });
  }

  update(id: number, updateClassDto: UpdateClassDto) {
    return `This action updates a #${id} class`;
  }

  remove(id: number) {
    return `This action removes a #${id} class`;
  }
}
