import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CouncilEvalutionService } from './councils-evaluation.service';
import { CreateCouncilEvalutionDto } from './dto/create-council-evalution.dto';
import { UpdateCouncilEvalutionDto } from './dto/update-council-evalution.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('council-evalution')
export class CouncilEvalutionController {
  constructor(private readonly councilEvalutionService: CouncilEvalutionService) {}

  @Post()
  create(@Body() createCouncilEvalutionDto: CreateCouncilEvalutionDto) {
    return this.councilEvalutionService.create(createCouncilEvalutionDto);
  }

  @Get()
  findAll() {
    return this.councilEvalutionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.councilEvalutionService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer","Student")
  update(@Param('id') id: string, @Body() updateCouncilEvalutionDto: UpdateCouncilEvalutionDto, @Req() req: any) {
    return this.councilEvalutionService.update(+id, updateCouncilEvalutionDto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.councilEvalutionService.remove(+id);
  }
}
