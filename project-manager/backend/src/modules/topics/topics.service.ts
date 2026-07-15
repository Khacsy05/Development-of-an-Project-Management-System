import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TopicQuery } from './dto/query-topic.dto';

@Injectable()
export class TopicService {
  constructor(private prisma: PrismaService) {}
  create(createTopicDto: CreateTopicDto) {
    return 'This action adds a new topic';
  }
  private toBoolean(isAvailable? : string) : boolean | undefined{
    return isAvailable === 'true' ? true : isAvailable === "false" ? false : undefined
  } 

  async findAll(query: TopicQuery) {
    const {isAvailable,title,page = 1, limit = 6} = query
    const isAvailableBoolean = this.toBoolean(isAvailable)
    const pageNumber = Math.max(1, Number(page) || 1)
    const limitNumber = Math.max(1, Number(limit) || 6)
    const titleNormalized = title?.trim();
    const skip = (pageNumber - 1) * limitNumber;
    const where = {
      is_available: isAvailableBoolean,
      title: title ? {
        contains: titleNormalized,
      } : undefined
    }
    const [topic,total] = await this.prisma.$transaction([
      this.prisma.topic.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: [
          {
            created_at: 'desc',
          },
          {
            topic_id: "desc"
          }
        ]
      }),
      this.prisma.topic.count({where})
       
    ])
    
    return {
      data: topic,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    }
    
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
