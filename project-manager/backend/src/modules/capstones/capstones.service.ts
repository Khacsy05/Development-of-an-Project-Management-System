import { Injectable } from '@nestjs/common';
import { CreateCapstoneDto } from './dto/create-capstone.dto';
import { UpdateCapstoneDto } from './dto/update-capstone.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CapstoneQuery } from './dto/query-capstone.dto';

@Injectable()
export class CapstonesService {
  constructor(private prisma : PrismaService){}
  create(createCapstoneDto: CreateCapstoneDto) {
    return 'This action adds a new capstone';
  }

  async findAll(query : CapstoneQuery) {
    const {status,page,limit} = query
    const pageNumber = Math.max(1,Number(page) || 1)
    const limitNumber = Math.max(1,Number(limit) || 6)
    const skip = (pageNumber-1) * limitNumber
    
    const where = {
        status : status? status : undefined
    }

    const [capstone,total] = await this.prisma.$transaction([
      this.prisma.capstone.findMany({
        where,
        skip,
        take:limitNumber,
        orderBy: [
          {
            created_at: 'desc',
          },
          {
            capstone_id : "desc"
          }
        ]
      }),
      this.prisma.capstone.count({where})
    ])

    return{
      
        data: capstone,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
      
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} capstone`;
  }

  update(id: number, updateCapstoneDto: UpdateCapstoneDto) {
    return `This action updates a #${id} capstone`;
  }

  remove(id: number) {
    return `This action removes a #${id} capstone`;
  }
}
