import { Injectable } from '@nestjs/common';
import { CreateExpertiseDto } from './dto/create-expertise.dto';
import { UpdateExpertiseDto } from './dto/update-expertise.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExpertisesService {
  constructor(private prisma: PrismaService) { }
  create(createExpertiseDto: CreateExpertiseDto) {
    return 'This action adds a new expertise';
  }

  findAll() {
    return this.prisma.expertise.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} expertise`;
  }

  update(id: number, updateExpertiseDto: UpdateExpertiseDto) {
    return `This action updates a #${id} expertise`;
  }

  remove(id: number) {
    return `This action removes a #${id} expertise`;
  }
}
