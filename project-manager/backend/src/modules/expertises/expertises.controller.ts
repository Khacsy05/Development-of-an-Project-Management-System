import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpertisesService } from './expertises.service';
import { CreateExpertiseDto } from './dto/create-expertise.dto';
import { UpdateExpertiseDto } from './dto/update-expertise.dto';

@Controller('expertises')
export class ExpertisesController {
  constructor(private readonly expertisesService: ExpertisesService) {}

  @Post()
  create(@Body() createExpertiseDto: CreateExpertiseDto) {
    return this.expertisesService.create(createExpertiseDto);
  }

  @Get()
  findAll() {
    return this.expertisesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertisesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpertiseDto: UpdateExpertiseDto) {
    return this.expertisesService.update(+id, updateExpertiseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expertisesService.remove(+id);
  }
}
