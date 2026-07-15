import { Injectable } from '@nestjs/common';
import { CreateCouncilDto } from './dto/create-council.dto';
import { UpdateCouncilDto } from './dto/update-council.dto';

@Injectable()
export class CouncilsService {
  create(createCouncilDto: CreateCouncilDto) {
    return 'This action adds a new council';
  }

  findAll() {
    return `This action returns all councils`;
  }

  findOne(id: number) {
    return `This action returns a #${id} council`;
  }

  update(id: number, updateCouncilDto: UpdateCouncilDto) {
    return `This action updates a #${id} council`;
  }

  remove(id: number) {
    return `This action removes a #${id} council`;
  }
}
