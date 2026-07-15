import { Module } from '@nestjs/common';
import { TopicService } from './topics.service';
import { TopicController } from './topics.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
