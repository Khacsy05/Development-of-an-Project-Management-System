import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCapstoneDto } from './dto/create-capstone.dto';
import { UpdateCapstoneDto } from './dto/update-capstone.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CapstoneQuery } from './dto/query-capstone.dto';

@Injectable()
export class CapstonesService {
  constructor(private prisma : PrismaService){}
  async create(createCapstoneDto: CreateCapstoneDto) {
    const {student_id} = createCapstoneDto
    const studentIdBigInt = BigInt(student_id);
    const currentSemester = await this.prisma.semester.findFirst({
      where: {
        start_date: { lte: new Date() },
        end_date: { gte: new Date() }
      }
    });
    if(!currentSemester) {
      throw new BadRequestException("Hiện tại không nằm trong thời gian của học kỳ nào được cấu hình!");
    }
    const existingCapstone = await this.prisma.capstone.findUnique({
      where: {
        student_id: studentIdBigInt
      }
    })

    if(existingCapstone){
      throw new BadRequestException('Mỗi sinh viên chỉ được phép đăng ký duy nhất 1 đồ án!');
    }

    return await this.prisma.capstone.create({
      data: {
        student_id : studentIdBigInt,
        semester_id : currentSemester.semester_id,
      }
    })
  }

  async findAll(query : CapstoneQuery) {
    const {status,page,limit} = query
    const pageNumber = Math.max(1,Number(page) || 1)
    const limitNumber = Math.max(1,Number(limit) || 6)
    const skip = (pageNumber-1) * limitNumber
    
    const where = {
        status : status? status : undefined
    }

    const [capstone,total] = await this.prisma.$transaction([
      this.prisma.capstone.findMany({
        where,
        skip,
        take:limitNumber,
        orderBy: [
          {
            created_at: 'desc',
          },
          {
            capstone_id : "desc"
          }
        ]
      }),
      this.prisma.capstone.count({where})
    ])

    return{
      
        data: capstone,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
      
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} capstone`;
  }

  async update(capstone_id: number, updateCapstoneDto: UpdateCapstoneDto) {
    const {
      student_id,
      lecturer_id,
      topic_id,
      instructor_grade,
      council_grade,
      council_id,
      status,
      defense_order,
      final_report_path,
      message
    } = updateCapstoneDto

    const capstone = await this.prisma.capstone.findUnique({
      where : {
        capstone_id: BigInt(capstone_id)
      }
    })
    if(!capstone){
      throw new BadRequestException('Hồ sơ đồ án không tồn tại');
    }

    
    
    try {
      return await this.prisma.$transaction(async (tx) => {
        const updateData: any = {
          status: lecturer_id ? 'PENDING_LECTURER' : (topic_id ? 'PENDING_FACULTY' : status),
          defense_order,
          final_report_path,
          instructor_grade,
          council_grade,
          student_id: student_id ? BigInt(student_id) : undefined,
          council_id: council_id ? BigInt(council_id) : undefined,
        };

        const updatedCapstone = await tx.capstone.update({
          where: {
            capstone_id: BigInt(capstone_id)
          },
          data: updateData
        });

        if(lecturer_id || topic_id){
          let requestType: 'REGISTER_LECTURER' | 'REGISTER_TOPIC';
          if(lecturer_id) {
            requestType = 'REGISTER_LECTURER'
          } 
          else {
            requestType = 'REGISTER_TOPIC';
          }

          await tx.capstoneRequest.create({
            data: {
              capstone_id: BigInt(capstone_id),
              sender_id: capstone.student_id, // Lấy ID của sinh viên sở hữu đồ án này
              request_type: requestType,
              message: message || `Sinh viên đăng ký ${requestType === 'REGISTER_LECTURER' ? 'giảng viên' : 'đề tài'} mới.`,
              target_id: lecturer_id ? BigInt(lecturer_id) : BigInt(topic_id!),
              status: 'PENDING', // Trạng thái yêu cầu ban đầu luôn là chờ duyệt
            }
          });
        }

        

      return updatedCapstone;
      })
      
    } catch (error) {
      throw new BadRequestException('Cập nhật thông tin đồ án thất bại. Vui lòng kiểm tra lại dữ liệu!');
    }
    
  }

  remove(id: number) {
    return `This action removes a #${id} capstone`;
  }
}
