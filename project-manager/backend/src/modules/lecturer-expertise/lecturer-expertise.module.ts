import { Module } from '@nestjs/common';
import { LecturerExpertiseService } from './lecturer-expertise.service';
import { LecturerExpertiseController } from './lecturer-expertise.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LecturerExpertiseController],
  providers: [LecturerExpertiseService],
})
export class LecturerExpertiseModule {}
