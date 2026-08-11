import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassQueryDto } from './dto/query-class.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  create(@Body() createClassDto: CreateClassDto, @Req() req: any) {
    return this.classesService.create(createClassDto, req);
  }

  @Get()
  findAll(@Query() query: ClassQueryDto) {
    return this.classesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(+id, updateClassDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  remove(@Param('id') id: string) {
    return this.classesService.remove(+id);
  }
}
