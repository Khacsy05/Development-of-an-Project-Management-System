import { Injectable } from '@nestjs/common';
import { CreateCapstonesSubmissionDto } from './dto/create-capstones-submission.dto';
import { UpdateCapstonesSubmissionDto } from './dto/update-capstones-submission.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CapstonesSubmissionService {
  constructor(private prisma: PrismaService){}
  create(createCapstonesSubmissionDto: CreateCapstonesSubmissionDto) {
    return 'This action adds a new capstonesSubmission';
  }

  findAll() {
    return `This action returns all capstonesSubmission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} capstonesSubmission`;
  }

  update(id: number, updateCapstonesSubmissionDto: UpdateCapstonesSubmissionDto) {
    return `This action updates a #${id} capstonesSubmission`;
  }

  remove(id: number) {
    return `This action removes a #${id} capstonesSubmission`;
  }
}
