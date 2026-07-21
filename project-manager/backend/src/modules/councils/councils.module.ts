import { Module } from '@nestjs/common';
import { CouncilsService } from './councils.service';
import { CouncilsController } from './councils.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports : [PrismaModule],
  controllers: [CouncilsController],
  providers: [CouncilsService],
})
export class CouncilsModule {}
