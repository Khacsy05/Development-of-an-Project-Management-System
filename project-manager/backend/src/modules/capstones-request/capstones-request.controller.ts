import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CapstonesRequestService } from './capstones-request.service';
import { CreateCapstonesRequestDto } from './dto/create-capstones-request.dto';
import { UpdateCapstonesRequestDto } from './dto/update-capstones-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('capstones-request')
export class CapstonesRequestController {
  constructor(private readonly capstonesRequestService: CapstonesRequestService) {}

  @Post()
  create(@Body() createCapstonesRequestDto: CreateCapstonesRequestDto) {
    return this.capstonesRequestService.create(createCapstonesRequestDto);
  }

  @Get()
  findAll() {
    return this.capstonesRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capstonesRequestService.findOne(+id);
  }

  @Patch(':request_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  update(@Param('request_id') request_id: number, @Body() updateCapstonesRequestDto: UpdateCapstonesRequestDto, @Req() req: any) {
    return this.capstonesRequestService.update(request_id, updateCapstonesRequestDto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.capstonesRequestService.remove(+id);
  }
}
