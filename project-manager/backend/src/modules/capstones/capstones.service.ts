import { Injectable } from '@nestjs/common';
import { CreateCapstoneDto } from './dto/create-capstone.dto';
import { UpdateCapstoneDto } from './dto/update-capstone.dto';

@Injectable()
export class CapstonesService {
  create(createCapstoneDto: CreateCapstoneDto) {
    return 'This action adds a new capstone';
  }

  findAll() {
    return `This action returns all capstones`;
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
