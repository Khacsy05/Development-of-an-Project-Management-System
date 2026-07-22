import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCapstoneDto } from './dto/create-capstone.dto';
import { UpdateCapstoneDto } from './dto/update-capstone.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CapstoneQuery } from './dto/query-capstone.dto';
import { AssignCouncilDto } from './dto/update-assignCouncil.dto';
import { CapstoneStatus } from '@prisma/client';

@Injectable()
export class CapstonesService {
  constructor(private prisma : PrismaService){}
  async create(createCapstoneDto: CreateCapstoneDto, req: any) {
    const {} = createCapstoneDto
    const user = req.user as any;
    const studentIdBigInt = BigInt(user.id);
    const student = await this.prisma.user.findUnique({
      where: {
        user_id: studentIdBigInt
      },
      include: {faculty: true}
    })
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
        faculty_id: student!.faculty!.faculty_id
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

  async update(capstone_id: number, updateCapstoneDto: UpdateCapstoneDto, req: any) {
    const {
      lecturer_id,
      topic_id,
      instructor_grade,
      council_grade,
      council_id,
      status,
      defense_order,
      final_report_path,
      message,
    } = updateCapstoneDto
    const capstoneIdBigInt = BigInt(capstone_id)
    const capstone = await this.prisma.capstone.findUnique({
      where : {
        capstone_id: capstoneIdBigInt
      },
      include: {
        faculty: true
      }
    })
    if(!capstone){
      throw new BadRequestException('Hồ sơ đồ án không tồn tại');
    }
    return await this.prisma.$transaction(async (tx) => {
        const updateData: any = {
          status: lecturer_id ? 'PENDING_LECTURER' : (topic_id ? 'PENDING_FACULTY' : status),
          defense_order,
          final_report_path,
          instructor_grade,
          council_grade,
          council_id: council_id ? BigInt(council_id) : undefined,
        };
        
        const updatedCapstone = await tx.capstone.update({
          where: {
            capstone_id: capstoneIdBigInt
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
              capstone_id: capstoneIdBigInt,
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
  }

  async assignCouncil(id: number, assignCouncilDto: AssignCouncilDto, req: any){
    const {council_id} = assignCouncilDto
    const councilBigInt = BigInt(council_id)
    const capstoneBigInt = BigInt(id)
    const user = req.user
    const capstone = await this.prisma.capstone.findUnique({
      where: { capstone_id: capstoneBigInt },
      include: {faculty: true}
    });

    if(String(user.id) !== String(capstone?.faculty.dean_id)){
      throw new BadRequestException('Bạn không phải giảng viên được chỉ định trong yêu cầu này');
    }

    if (!capstone) {
      throw new NotFoundException('Không tìm thấy đồ án tốt nghiệp');
    }

    // 2. Validation nghiệp vụ: Đồ án phải đủ điều kiện bảo vệ
    if (capstone.status !== CapstoneStatus.DEFENSE_ELIGIBLE) {
      throw new BadRequestException('Đồ án chưa đủ điều kiện bảo vệ để gán Hội đồng');
    }
    const council = await this.prisma.council.findUnique({
      where: { council_id: councilBigInt },
      include: { members: true },
    });

    if (!council) {
      throw new NotFoundException('Hội đồng được chỉ định không tồn tại');
    }
    return this.prisma.$transaction(async (tx) => {
      const capstoneUpdate = await tx.capstone.update({
        where: {
          capstone_id: capstoneBigInt
        },
        data: {council_id: councilBigInt}
      })

      const councilEvaluation =await tx.councilEvaluation.findFirst({
        where : {
          capstone_id : capstoneBigInt
        }
      })
      if(!councilEvaluation){
        const allMembers = council.members;
        if (allMembers.length > 0) {
          const evaluationPromises = allMembers.map((member) => {
            return tx.councilEvaluation.create({
              data: {
                capstone_id: capstoneBigInt,
                members_id: member.lecturer_id,
                council_id: councilBigInt
              }
            });
          });

          await Promise.all(evaluationPromises);
        }
      }
      return capstoneUpdate
    })
  }

  remove(id: number) {
    return `This action removes a #${id} capstone`;
  }
}
