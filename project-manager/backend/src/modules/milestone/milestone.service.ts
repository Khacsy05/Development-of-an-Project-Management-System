import { Injectable } from '@nestjs/common';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MilestoneService {

  constructor(private prisma: PrismaService) { }
  create(createMilestoneDto: CreateMilestoneDto) {
    return 'This action adds a new milestone';
  }

  findAll() {
    return this.prisma.milestone.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} milestone`;
  }

  update(id: number, updateMilestoneDto: UpdateMilestoneDto) {
    return `This action updates a #${id} milestone`;
  }

  remove(id: number) {
    return `This action removes a #${id} milestone`;
  }
}
