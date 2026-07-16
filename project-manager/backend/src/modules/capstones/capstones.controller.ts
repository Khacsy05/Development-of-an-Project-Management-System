import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CapstonesService } from './capstones.service';
import { CreateCapstoneDto } from './dto/create-capstone.dto';
import { UpdateCapstoneDto } from './dto/update-capstone.dto';
import { CapstoneQuery } from './dto/query-capstone.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('capstones')

export class CapstonesController {
  constructor(private readonly capstonesService: CapstonesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Student")
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

  @Patch(':capstone_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Student")
  update(@Param('capstone_id') capstone_id: number, @Body() updateCapstoneDto: UpdateCapstoneDto) {
    return this.capstonesService.update(capstone_id, updateCapstoneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.capstonesService.remove(+id);
  }
}
