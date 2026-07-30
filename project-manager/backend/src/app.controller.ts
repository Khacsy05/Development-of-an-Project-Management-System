import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './common/utils/file-upload.utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions('transcripts')))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      file_path: `/uploads/transcripts/${file.filename}`,
    };
  }
}
