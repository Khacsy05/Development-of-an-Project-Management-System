import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TopicService {
  constructor(private prisma: PrismaService) {}
  create(createTopicDto: CreateTopicDto) {
    return 'This action adds a new topic';
  }

  async findAll(isAvailable?: string) {
    const isAvailableBoolean = isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined;
    return await this.prisma.topic.findMany({
      where: {
        is_available: isAvailableBoolean ? isAvailableBoolean : undefined,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.topic.findUnique({
      where: {
        topic_id: id,
      },
    });
  }

  

  update(id: number, updateTopicDto: UpdateTopicDto) {
    return `This action updates a #${id} topic`;
  }

  remove(id: number) {
    return `This action removes a #${id} topic`;
  }
}
