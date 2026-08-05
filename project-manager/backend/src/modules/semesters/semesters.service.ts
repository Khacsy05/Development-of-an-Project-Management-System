import { Injectable } from '@nestjs/common';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SemestersService {
  constructor(private prisma: PrismaService) { }
  create(createSemesterDto: CreateSemesterDto) {
    return 'This action adds a new semester';
  }

  findAll() {
    return this.prisma.semester.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} semester`;
  }

  update(id: number, updateSemesterDto: UpdateSemesterDto) {
    return `This action updates a #${id} semester`;
  }

  remove(id: number) {
    return `This action removes a #${id} semester`;
  }
}
