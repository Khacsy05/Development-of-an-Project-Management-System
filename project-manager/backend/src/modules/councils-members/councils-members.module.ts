import { Module } from '@nestjs/common';
import { CouncilsMembersService } from './councils-members.service';
import { CouncilsMembersController } from './councils-members.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CouncilsMembersController],
  providers: [CouncilsMembersService],
})
export class CouncilsMembersModule {}
