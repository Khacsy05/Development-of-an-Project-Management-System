import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCapstonesRequestDto } from './dto/create-capstones-request.dto';
import { UpdateCapstonesRequestDto } from './dto/update-capstones-request.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CapstoneStatus } from '@prisma/client';
import { CapstoneRequestQuery } from './dto/query-capstone-request.dto';

@Injectable()
export class CapstonesRequestService {
  constructor(private prisma: PrismaService) { }
  create(createCapstonesRequestDto: CreateCapstonesRequestDto) {
    return 'This action adds a new capstonesRequest';
  }

  async findAll(query: CapstoneRequestQuery) {
    const { status, target_id, request_type, page, limit } = query;
    const where: any = {};
    if (status) where.status = status;
    if (request_type) where.request_type = request_type;

    if (target_id) {
      if (request_type === 'REGISTER_LECTURER') {
        where.target_id = BigInt(target_id);
      } else if (request_type === 'REGISTER_TOPIC') {
        const faculty = await this.prisma.faculty.findFirst({
          where: { dean_id: BigInt(target_id) },
          select: { faculty_id: true }
        });
        if (faculty) {
          const topics = await this.prisma.topic.findMany({
            where: { faculty_id: faculty.faculty_id },
            select: { topic_id: true }
          });
          const topicIds = topics.map(t => t.topic_id);
          where.target_id = { in: topicIds };
        } else {
          where.target_id = -1n;
        }
      } else {
        where.target_id = BigInt(target_id);
      }
    }

    const pageNumber = Math.max(1, Number(page) || 1)
    const limitNumber = Math.max(1, Number(limit) || 6)
    const skip = (pageNumber - 1) * limitNumber

    const [capstoneRequests, total] = await Promise.all([
      this.prisma.capstoneRequest.findMany({
        where,
        skip,
        take: limitNumber,
        include: {
          sender: {
            include: {
              student: {
                include: {
                  class: true
                }
              }
            }
          }
        }
      }),
      this.prisma.capstoneRequest.count({ where })
    ]);

    // Batch query tên các đề tài để tránh lỗi N+1 query
    const topicIdsToFetch = capstoneRequests
      .filter(req => req.request_type === 'REGISTER_TOPIC' && req.target_id)
      .map(req => req.target_id as bigint);

    const topics = await this.prisma.topic.findMany({
      where: { topic_id: { in: topicIdsToFetch } },
      select: { topic_id: true, title: true, description: true, technologies: true }
    });

    const topicMap = new Map(topics.map(t => [String(t.topic_id), t.title]));

    const topicDecorate = topics.map(t => {
      return {
        ...t,
        description: t.description?.split('\n').filter(Boolean),
        technologies: t.technologies?.split('\n').filter(Boolean)
      }
    })

    const topicMapDecorate = new Map(topicDecorate.map(t => [String(t.topic_id), t]));

    return {
      data: capstoneRequests.map((req) => ({
        request_id: String(req.request_id),
        capstone_id: String(req.capstone_id),
        sender_id: String(req.sender_id),
        request_type: req.request_type,
        message: req.message,
        file_path: req.file_path,
        target_id: req.target_id ? String(req.target_id) : null,
        topic_title: req.request_type === 'REGISTER_TOPIC' && req.target_id
          ? topicMap.get(String(req.target_id)) || 'Đề tài không tồn tại'
          : null,
        topic_description: req.request_type === 'REGISTER_TOPIC' && req.target_id
          ? topicMapDecorate.get(String(req.target_id))?.description
          : null,

        topic_technologies: req.request_type === 'REGISTER_TOPIC' && req.target_id
          ? topicMapDecorate.get(String(req.target_id))?.technologies
          : null,

        status: req.status,
        feedback: req.feedback,
        created_at: req.created_at,
        updated_at: req.updated_at,
        student: req.sender && req.sender.student ? {
          user_id: String(req.sender.user_id),
          student_code: req.sender.usercode,
          name: req.sender.fullname,
          email: req.sender.email,
          class_name: req.sender.student.class.class_name,
        } : null
      })),
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      }
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} capstonesRequest`;
  }

  async update(request_id: number, updateCapstonesRequestDto: UpdateCapstonesRequestDto, req: any) {
    const { status, feedback } = updateCapstonesRequestDto
    const user = req.user as any;
    const requestIdBigInt = BigInt(request_id);
    const capstoneRequest = await this.prisma.capstoneRequest.findUnique({
      where: {
        request_id: requestIdBigInt
      },
      include: { capstone: true }
    })
    if (!capstoneRequest) {
      throw new BadRequestException('Hồ sơ yêu cầu k tồn tại');
    }
    if (capstoneRequest.status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu này đã được xử lý và đóng lại trước đó!');
    }

    const capstone = capstoneRequest.capstone;
    if (capstoneRequest.request_type === "REGISTER_TOPIC") {
      const topic = await this.prisma.topic.findUnique({
        where: {
          topic_id: capstoneRequest.target_id ? BigInt(capstoneRequest.target_id) : undefined
        },
        include: {
          faculty: true
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
    else if (capstoneRequest.request_type === "REGISTER_LECTURER") {
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
    try {
      return await this.prisma.$transaction(async (tx) => {


        const updateCapstonesRequest = await tx.capstoneRequest.update({
          where: {
            request_id: BigInt(request_id)
          },
          data: { status, feedback }
        })

        let finalLecturerId = capstone.lecturer_id;
        let finalTopicId = capstone.topic_id;
        let nextStatus = capstone.status;
        if (status === "APPROVED") {
          if (capstoneRequest.request_type === "REGISTER_TOPIC") {
            finalTopicId = capstoneRequest.target_id
            nextStatus = finalLecturerId ? "DOING" : "PENDING"
          }
          else if (capstoneRequest.request_type === "REGISTER_LECTURER") {
            finalLecturerId = capstoneRequest.target_id
            nextStatus = finalTopicId ? "DOING" : "PENDING"
          }
        }
        else if (status === "REJECTED") {
          // Nếu bị từ chối, trả trạng thái Capstone về lại bước trước đó để sinh viên gửi lại request mới
          nextStatus = capstoneRequest.request_type === "REGISTER_TOPIC" ? "PENDING_FACULTY" : "PENDING_LECTURER";
        }
        await tx.capstone.update({
          where: {
            capstone_id: updateCapstonesRequest.capstone_id
          },
          data: {
            lecturer_id: finalLecturerId,
            topic_id: finalTopicId,
            status: nextStatus
          }
        })

        if (capstone.status !== CapstoneStatus.DOING && nextStatus === CapstoneStatus.DOING) {

          // 1. Kiểm tra xem thực sự trong DB đã có bản ghi submission nào chưa cho chắc chắn
          const existingSubmissions = await tx.capstoneSubmission.findFirst({
            where: { capstone_id: capstone.capstone_id },

          });

          // Nếu chưa từng có bản ghi nào thì mới tạo mới 4 giai đoạn
          if (!existingSubmissions) {

            const allMilestones = await tx.milestone.findMany();

            const submissionPromises = allMilestones.map((milestone) => {
              return tx.capstoneSubmission.create({
                data: {
                  capstone_id: capstone.capstone_id,
                  milestone_id: milestone.milestone_id,
                  status: 'PENDING', // Đợi sinh viên nộp bài
                },
              });
            });

            await Promise.all(submissionPromises);
          }
        }

        return updateCapstonesRequest
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Đề tài này đã được đăng ký và phê duyệt cho một sinh viên khác trong học kỳ này!');
      }
      throw error;
    }

  }

  remove(id: number) {
    return `This action removes a #${id} capstonesRequest`;
  }
}
