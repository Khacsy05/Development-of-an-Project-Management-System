import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { CapstonesService } from './capstones.service';
import { CreateCapstoneDto } from './dto/create-capstone.dto';
import { UpdateCapstoneDto } from './dto/update-capstone.dto';
import { CapstoneQuery } from './dto/query-capstone.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AssignCouncilDto } from './dto/update-assignCouncil.dto';

@Controller('capstones')

export class CapstonesController {
  constructor(private readonly capstonesService: CapstonesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Student")
  create(@Body() createCapstoneDto: CreateCapstoneDto, @Req() req: any) {
    return this.capstonesService.create(createCapstoneDto,req);
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
  @Roles("Student", "Lecturer")
  update(@Param('capstone_id') capstone_id: number, @Body() updateCapstoneDto: UpdateCapstoneDto, @Req() req: any) {
    return this.capstonesService.update(capstone_id, updateCapstoneDto,req);
  }

  @Patch(':id/assignCouncil')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  assignCouncil(
    @Param('id') id: number, 
    @Body() assignCouncilDto: AssignCouncilDto,
    @Req() req: any
  ){
    return this.capstonesService.assignCouncil(id, assignCouncilDto,req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.capstonesService.remove(+id);
  }
}
