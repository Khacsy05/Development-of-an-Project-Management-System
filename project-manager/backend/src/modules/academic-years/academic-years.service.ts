import { Injectable } from '@nestjs/common';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearsService {
  create(createAcademicYearDto: CreateAcademicYearDto) {
    return 'This action adds a new academicYear';
  }

  findAll() {
    return `This action returns all academicYears`;
  }

  findOne(id: number) {
    return `This action returns a #${id} academicYear`;
  }

  update(id: number, updateAcademicYearDto: UpdateAcademicYearDto) {
    return `This action updates a #${id} academicYear`;
  }

  remove(id: number) {
    return `This action removes a #${id} academicYear`;
  }
}
