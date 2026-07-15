import { Module } from '@nestjs/common';
import { CapstonesService } from './capstones.service';
import { CapstonesController } from './capstones.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CapstonesController],
  providers: [CapstonesService],
})
export class CapstonesModule {}
