import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

export const multerOptions = (folderName: string = 'general') => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = `./uploads/${folderName}`;
      // Tự động tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Tạo tên file độc nhất: timestamp + random-number + đuôi file gốc (.pdf, .docx...)
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    // 1. Lấy đuôi file (extension) từ tên gốc
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    
    // 2. Danh sách các đuôi file được phép upload
    const allowedExtensions = ['pdf', 'doc', 'docx', 'zip', 'rar'];

    // 3. Kiểm tra theo ĐUÔI FILE thay vì chỉ kiểm tra mimetype
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new BadRequestException('Chỉ chấp nhận file định dạng PDF, DOC, DOCX, ZIP, RAR!'), false);
    }
    },
  limits: {
    fileSize: 20 * 1024 * 1024, // Giới hạn kích thước file tối đa 20MB
  },
});