import { Module } from '@nestjs/common';
import { CapstonesService } from './capstones.service';
import { CapstonesController } from './capstones.controller';

@Module({
  controllers: [CapstonesController],
  providers: [CapstonesService],
})
export class CapstonesModule {}
