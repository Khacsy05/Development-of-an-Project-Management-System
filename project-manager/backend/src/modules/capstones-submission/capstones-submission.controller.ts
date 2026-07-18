import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CapstonesSubmissionService } from './capstones-submission.service';
import { CreateCapstonesSubmissionDto } from './dto/create-capstones-submission.dto';
import { UpdateCapstonesSubmissionDto } from './dto/update-capstones-submission.dto';

@Controller('capstones-submission')
export class CapstonesSubmissionController {
  constructor(private readonly capstonesSubmissionService: CapstonesSubmissionService) {}

  @Post()
  create(@Body() createCapstonesSubmissionDto: CreateCapstonesSubmissionDto) {
    return this.capstonesSubmissionService.create(createCapstonesSubmissionDto);
  }

  @Get()
  findAll() {
    return this.capstonesSubmissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capstonesSubmissionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCapstonesSubmissionDto: UpdateCapstonesSubmissionDto) {
    return this.capstonesSubmissionService.update(+id, updateCapstonesSubmissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.capstonesSubmissionService.remove(+id);
  }
}
