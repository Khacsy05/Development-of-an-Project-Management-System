import { Module } from '@nestjs/common';
import { CapstonesSubmissionService } from './capstones-submission.service';
import { CapstonesSubmissionController } from './capstones-submission.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CapstonesSubmissionController],
  providers: [CapstonesSubmissionService],
})
export class CapstonesSubmissionModule {}
