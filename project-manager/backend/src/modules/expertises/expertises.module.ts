import { Module } from '@nestjs/common';
import { ExpertisesService } from './expertises.service';
import { ExpertisesController } from './expertises.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExpertisesController],
  providers: [ExpertisesService],
})
export class ExpertisesModule { }
