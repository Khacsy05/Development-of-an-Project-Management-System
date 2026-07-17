import { Module } from '@nestjs/common';
import { CapstonesRequestService } from './capstones-request.service';
import { CapstonesRequestController } from './capstones-request.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CapstonesRequestController],
  providers: [CapstonesRequestService],
})
export class CapstonesRequestModule {}
