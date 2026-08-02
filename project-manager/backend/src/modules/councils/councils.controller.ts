import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CouncilsService } from './councils.service';
import { CreateCouncilDto } from './dto/create-council.dto';
import { UpdateCouncilDto } from './dto/update-council.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CouncilMemberQuery } from './dto/query-council.dto';

@Controller('councils')
export class CouncilsController {
  constructor(private readonly councilsService: CouncilsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Admin")
  create(@Body() createCouncilDto: CreateCouncilDto) {
    return this.councilsService.create(createCouncilDto);
  }

  @Get()

  findAll(@Query() query: CouncilMemberQuery) {
    return this.councilsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.councilsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Admin")
  update(@Param('id') id: string, @Body() updateCouncilDto: UpdateCouncilDto) {
    return this.councilsService.update(+id, updateCouncilDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.councilsService.remove(+id);
  }
}
