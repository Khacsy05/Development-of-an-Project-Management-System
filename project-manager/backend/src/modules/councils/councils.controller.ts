import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { CouncilsService } from './councils.service';
import { CreateCouncilDto } from './dto/create-council.dto';
import { UpdateCouncilDto } from './dto/update-council.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CouncilQueryDto } from './dto/query-council.dto';

@Controller('councils')
export class CouncilsController {
  constructor(private readonly councilsService: CouncilsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  create(@Body() createCouncilDto: CreateCouncilDto, @Req() req: any) {
    return this.councilsService.create(createCouncilDto, req);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Query() query: CouncilQueryDto, @Req() req: any) {
    return this.councilsService.findAll(query, req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.councilsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  update(@Param('id') id: string, @Body() updateCouncilDto: UpdateCouncilDto) {
    return this.councilsService.update(+id, updateCouncilDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  remove(@Param('id') id: string) {
    return this.councilsService.remove(+id);
  }
}
