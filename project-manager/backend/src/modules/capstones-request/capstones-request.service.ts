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
    const requestIdBigInt = BigInt(request_id);
    const capstoneRequest = await this.prisma.capstoneRequest.findUnique({
      where: {
        request_id: requestIdBigInt
      },
      include: { capstone: true }
    })
    if(!capstoneRequest){
      throw new BadRequestException('Hồ sơ yêu cầu k tồn tại');
    }
    if (capstoneRequest.status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu này đã được xử lý và đóng lại trước đó!');
    }

    const capstone = capstoneRequest.capstone;
    if(capstoneRequest.request_type === "REGISTER_TOPIC"){
        const topic = await this.prisma.topic.findUnique({
          where: {
            topic_id: requestIdBigInt
          },
          include: {
            faculty : true
          }
        })
        if (!topic) throw new BadRequestException('Đề tài không tồn tại');

        // console.log('--- ĐANG SO SÁNH QUYỀN TRƯỞNG KHOA (DEAN) ---');
        // console.log('Thông tin user đăng nhập:', user);
        // console.log('ID của user đăng nhập (String):', String(user.id));
        // console.log('Dean ID của khoa (String):', topic.faculty.dean_id ? String(topic.faculty.dean_id) : 'null');
        // console.log('Kết quả so sánh bằng:', String(topic.faculty.dean_id) === String(user.id));
        // console.log('---------------------------------------------');
        if (!topic.faculty.dean_id || String(topic.faculty.dean_id) !== String(user.id)) {
          throw new BadRequestException('Bạn không có quyền chỉnh sửa yêu cầu đề tài này');
        }
    }
    else if(capstoneRequest.request_type === "REGISTER_LECTURER"){
        if (String(capstoneRequest.target_id) !== String(user.id)) {
          throw new BadRequestException('Bạn không phải giảng viên được chỉ định trong yêu cầu này');
        }        
        // console.log('--- ĐANG SO SÁNH QUYỀN TRƯỞNG KHOA (DEAN) ---');
        // console.log('Thông tin user đăng nhập:', user);
        // console.log('ID của user đăng nhập (String):', String(user.id));
        // console.log('ID của GIANG VIEN (String):', lecturer.user_id? String(lecturer.user_id) : 'null');
        // console.log('Kết quả so sánh bằng:', String(lecturer.user_id) === String(user.id));
        // console.log('---------------------------------------------');
    }
    return await this.prisma.$transaction(async (tx) =>{  
        

        const updateCapstonesRequest = await tx.capstoneRequest.update({
          where : {
            request_id : BigInt(request_id)
          },
          data: { status, feedback }
        })

        let finalLecturerId = capstone.lecturer_id;
        let finalTopicId = capstone.topic_id;
        let nextStatus = capstone.status;
        if(status ==="APPROVED"){
          if(capstoneRequest.request_type === "REGISTER_TOPIC"){
            finalTopicId = capstoneRequest.target_id
            nextStatus = finalLecturerId ? "DOING" : "PENDING"
          }
          else if(capstoneRequest.request_type === "REGISTER_LECTURER"){
            finalLecturerId = capstoneRequest.target_id
            nextStatus = finalTopicId ? "DOING" : "PENDING"
          }
        }
        else if (status === "REJECTED") {
          // Nếu bị từ chối, trả trạng thái Capstone về lại bước trước đó để sinh viên gửi lại request mới
          nextStatus = capstoneRequest.request_type === "REGISTER_TOPIC" ? "PENDING_FACULTY" : "PENDING_LECTURER";
        }
        await tx.capstone.update({
          where :{
            capstone_id: updateCapstonesRequest.capstone_id
          },
          data: {
            lecturer_id: finalLecturerId,
            topic_id: finalTopicId,
            status: nextStatus
          }
        })

        return updateCapstonesRequest
      })
    
  }

  remove(id: number) {
    return `This action removes a #${id} capstonesRequest`;
  }
}
