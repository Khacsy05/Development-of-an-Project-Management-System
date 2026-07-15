import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CouncilsService } from './councils.service';
import { CreateCouncilDto } from './dto/create-council.dto';
import { UpdateCouncilDto } from './dto/update-council.dto';

@Controller('councils')
export class CouncilsController {
  constructor(private readonly councilsService: CouncilsService) {}

  @Post()
  create(@Body() createCouncilDto: CreateCouncilDto) {
    return this.councilsService.create(createCouncilDto);
  }

  @Get()
  findAll() {
    return this.councilsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.councilsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouncilDto: UpdateCouncilDto) {
    return this.councilsService.update(+id, updateCouncilDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.councilsService.remove(+id);
  }
}
