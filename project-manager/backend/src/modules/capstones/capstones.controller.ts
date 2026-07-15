import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CapstonesService } from './capstones.service';
import { CreateCapstoneDto } from './dto/create-capstone.dto';
import { UpdateCapstoneDto } from './dto/update-capstone.dto';
import { CapstoneQuery } from './dto/query-capstone.dto';

@Controller('capstones')
export class CapstonesController {
  constructor(private readonly capstonesService: CapstonesService) {}

  @Post()
  create(@Body() createCapstoneDto: CreateCapstoneDto) {
    return this.capstonesService.create(createCapstoneDto);
  }

  @Get()
  findAll(@Query("") query : CapstoneQuery) {
    return this.capstonesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capstonesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCapstoneDto: UpdateCapstoneDto) {
    return this.capstonesService.update(+id, updateCapstoneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.capstonesService.remove(+id);
  }
}
