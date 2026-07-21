import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CouncilsMembersService } from './councils-members.service';
import { CreateCouncilsMemberDto } from './dto/create-councils-member.dto';
import { UpdateCouncilsMemberDto } from './dto/update-councils-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('councils-members')
export class CouncilsMembersController {
  constructor(private readonly councilsMembersService: CouncilsMembersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  create(@Body() createCouncilsMemberDto: CreateCouncilsMemberDto,@Req() req: any) {
    return this.councilsMembersService.create(createCouncilsMemberDto,req);
  }

  @Get()
  findAll() {
    return this.councilsMembersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.councilsMembersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouncilsMemberDto: UpdateCouncilsMemberDto) {
    return this.councilsMembersService.update(+id, updateCouncilsMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.councilsMembersService.remove(+id);
  }
}
