import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { CapstonesSubmissionService } from './capstones-submission.service';
import { CreateCapstonesSubmissionDto } from './dto/create-capstones-submission.dto';
import { UpdateCapstonesSubmissionDto } from './dto/update-capstones-submission.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../../common/utils/file-upload.utils';

@Controller('capstones-submission')
export class CapstonesSubmissionController {
  constructor(private readonly capstonesSubmissionService: CapstonesSubmissionService) {}

  @Post()
  create(@Body() createCapstonesSubmissionDto: CreateCapstonesSubmissionDto) {
    return this.capstonesSubmissionService.create(createCapstonesSubmissionDto);
  }

  @Get()
  findAll() {
    return this.capstonesSubmissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capstonesSubmissionService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', multerOptions('submissions')))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer", "Student")
  update(
    @Param('id') id: string, 
    @Body() updateCapstonesSubmissionDto: UpdateCapstonesSubmissionDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    // 1. Tạo đường dẫn tương đối nếu người dùng có upload file
    if (file) {
      updateCapstonesSubmissionDto.file_path = `/uploads/submissions/${file.filename}`;
    }

    // 2. Truyền đúng 2 đối số vào hàm Service: (+id và dto)
    return this.capstonesSubmissionService.update(+id, updateCapstonesSubmissionDto,req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.capstonesSubmissionService.remove(+id);
  }
}