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

  findAll(semester_id?: string) {
    const where: any = {};
    if (semester_id) {
      where.semester_id = BigInt(semester_id);
    }
    return this.prisma.milestone.findMany({
      where,
      orderBy: {
        milestone_id: 'asc'
      }
    });
  }

  findOne(id: number) {
    return this.prisma.milestone.findUnique({
      where: { milestone_id: BigInt(id) }
    });
  }

  async update(id: number, updateMilestoneDto: UpdateMilestoneDto) {
    const { phase_name, description, deadline } = updateMilestoneDto as any;
    const parsedDeadline = deadline ? new Date(deadline.replace(' ', 'T')) : undefined;

    return await this.prisma.milestone.update({
      where: { milestone_id: BigInt(id) },
      data: {
        phase_name,
        description,
        deadline: parsedDeadline
      }
    });
  }

  remove(id: number) {
    return this.prisma.milestone.delete({
      where: { milestone_id: BigInt(id) }
    });
  }
}
