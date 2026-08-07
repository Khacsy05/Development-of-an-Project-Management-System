import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('milestone')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Post()
  @Roles("Lecturer")
  create(@Body() createMilestoneDto: CreateMilestoneDto) {
    return this.milestoneService.create(createMilestoneDto);
  }

  @Get()
  findAll(@Query('semester_id') semester_id?: string) {
    return this.milestoneService.findAll(semester_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.milestoneService.findOne(+id);
  }

  @Patch(':id')
  @Roles("Lecturer")
  update(@Param('id') id: string, @Body() updateMilestoneDto: UpdateMilestoneDto) {
    return this.milestoneService.update(+id, updateMilestoneDto);
  }

  @Delete(':id')
  @Roles("Lecturer")
  remove(@Param('id') id: string) {
    return this.milestoneService.remove(+id);
  }
}
