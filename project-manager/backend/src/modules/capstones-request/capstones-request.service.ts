import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCapstonesRequestDto } from './dto/create-capstones-request.dto';
import { UpdateCapstonesRequestDto } from './dto/update-capstones-request.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CapstonesRequestService {
  constructor(private prisma: PrismaService) {}
  create(createCapstonesRequestDto: CreateCapstonesRequestDto) {
    return 'This action adds a new capstonesRequest';
  }

  findAll() {
    return `This action returns all capstonesRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} capstonesRequest`;
  }

  async update(request_id: number, updateCapstonesRequestDto: UpdateCapstonesRequestDto, req: any) {
    const {status,feedback} = updateCapstonesRequestDto
    const user = req.user as any;
    const capstoneRequest = await this.prisma.capstoneRequest.findUnique({
      where: {
        request_id: BigInt(request_id)
      }
    })
    if(!capstoneRequest){
      throw new BadRequestException('Hồ sơ yêu cầu k tồn tại');
    }
    if(capstoneRequest.request_type === "REGISTER_TOPIC" && capstoneRequest.status !== "APPROVED"){
        const topic = await this.prisma.topic.findUnique({
          where: {
            topic_id: BigInt(capstoneRequest.target_id!)
          },
          include: {
            faculty : true
          }
        })
        if(!topic) {
          throw new BadRequestException('Topic k tồn tại');
        }

        console.log('--- ĐANG SO SÁNH QUYỀN TRƯỞNG KHOA (DEAN) ---');
        console.log('Thông tin user đăng nhập:', user);
        console.log('ID của user đăng nhập (String):', String(user.id));
        console.log('Dean ID của khoa (String):', topic.faculty.dean_id ? String(topic.faculty.dean_id) : 'null');
        console.log('Kết quả so sánh bằng:', String(topic.faculty.dean_id) === String(user.id));
        console.log('---------------------------------------------');
        if (!topic.faculty.dean_id || String(topic.faculty.dean_id) !== String(user.id)) {
          throw new BadRequestException('Ban k co quyen chinh sua');
        }
    }
    else if(capstoneRequest.request_type === "REGISTER_LECTURER" && capstoneRequest.status !== "APPROVED"){
        const lecturer = this.prisma.user.findUnique({
          where: {
            user_id: BigInt(capstoneRequest.target_id!)
          }
        })
    }
    try {
      return await this.prisma.$transaction(async (tx) =>{
        const updateCR: any = {
          status: status,
          feedback: feedback
        };

        const updateCapstonesRequest = await tx.capstoneRequest.update({
          where : {
            request_id : BigInt(request_id)
          },
          data: updateCR
        })
      })
    } catch (error) {
      
    }
  }

  remove(id: number) {
    return `This action removes a #${id} capstonesRequest`;
  }
}
