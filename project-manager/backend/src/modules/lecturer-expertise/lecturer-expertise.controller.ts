import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LecturerExpertiseService } from './lecturer-expertise.service';
import { SaveLecturerExpertiseDto } from './dto/create-lecturer-expertise.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('lecturer-expertise')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LecturerExpertiseController {
  constructor(private readonly lecturerExpertiseService: LecturerExpertiseService) { }

  @Get('my')
  @Roles("Lecturer")
  findMy(@Req() req: any) {
    const user = req.user as any;
    return this.lecturerExpertiseService.findMyExpertises(user.id);
  }

  @Post('my')
  @Roles("Lecturer")
  saveMy(@Req() req: any, @Body() saveLecturerExpertiseDto: SaveLecturerExpertiseDto) {
    const user = req.user as any;
    return this.lecturerExpertiseService.saveMyExpertises(user.id, saveLecturerExpertiseDto);
  }
}
