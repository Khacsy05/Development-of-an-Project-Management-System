import { Module } from '@nestjs/common';
import { CouncilEvalutionService } from './councils-evaluation.service';
import { CouncilEvalutionController } from './councils-evaluation.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CouncilEvalutionController],
  providers: [CouncilEvalutionService],
})
export class CouncilEvalutionModule {}
