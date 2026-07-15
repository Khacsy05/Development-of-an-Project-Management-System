import { Injectable } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}
  create(createClassDto: CreateClassDto) {
    return 'This action adds a new class';
  }

  async findAll() {
    return await this.prisma.class.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
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
