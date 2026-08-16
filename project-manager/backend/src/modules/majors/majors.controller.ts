import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { MajorsService } from './majors.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('majors')
export class MajorsController {
  constructor(private readonly majorsService: MajorsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Admin")
  create(@Body() createMajorDto: CreateMajorDto) {
    return this.majorsService.create(createMajorDto);
  }

  @Get()
  findAll() {
    return this.majorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.majorsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Admin")
  update(@Param('id') id: string, @Body() updateMajorDto: UpdateMajorDto) {
    return this.majorsService.update(+id, updateMajorDto);
  }
}
