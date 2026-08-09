import { BadRequestException, ForbiddenException, Injectable, UseGuards } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TopicQuery } from './dto/query-topic.dto';


@Injectable()
export class TopicService {
  constructor(private prisma: PrismaService) { }
  async create(createTopicDto: CreateTopicDto, req: any) {
    const user = req.user as any
    const { expertise_id, description, technologies, title } = createTopicDto

    if (!expertise_id || !technologies || !title) {
      throw new BadRequestException('Vui long nhap day du du lieu');
    }
    const expertiseBigInt = BigInt(expertise_id)
    const facultyBigInt = BigInt(user.faculty_id)
    const isExisExpertise = await this.prisma.expertise.findUnique({
      where: { expertise_id: expertiseBigInt }
    })

    if (!isExisExpertise) {
      throw new BadRequestException('Chuyen mon khong ton tai');
    }

    const isExisFaculty = await this.prisma.faculty.findUnique({
      where: { faculty_id: facultyBigInt }
    })

    if (!isExisFaculty) {
      throw new BadRequestException('Khoa khong ton tai');
    }

    const isAdmin = user.role === 'Admin';
    const isDean = isExisFaculty.dean_id && String(user.id) === String(isExisFaculty.dean_id);
    const initialStatus = (isAdmin || isDean) ? 'APPROVED' : 'PENDING';

    return await this.prisma.topic.create({
      data: {
        created_by: user.id,
        faculty_id: facultyBigInt,
        expertise_id: expertiseBigInt,
        description: description,
        is_bank_topic: user.role === "Student" ? false : true,
        status: initialStatus,
        title: title,
        technologies: technologies
      }
    });
  }
  private toBoolean(isAvailable?: string): boolean | undefined {
    return isAvailable === 'true' ? true : isAvailable === "false" ? false : undefined
  }

  async findAll(query: TopicQuery) {
    const { isAvailable, title, page = 1, limit = 6, facultyId } = query
    const isAvailableBoolean = this.toBoolean(isAvailable)
    const pageNumber = Math.max(1, Number(page) || 1)
    const limitNumber = Math.max(1, Number(limit) || 6)
    const titleNormalized = title?.trim();
    const skip = (pageNumber - 1) * limitNumber;
    const where: any = {
      is_available: isAvailableBoolean
    }

    if (facultyId) {
      where.faculty_id = BigInt(facultyId)
    }
    if (title) {
      where.title = {
        contains: titleNormalized,
      }
    }
    const [topic, total] = await this.prisma.$transaction([
      this.prisma.topic.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: [
          {
            created_at: 'desc',
          },
          {
            topic_id: "desc"
          }
        ],
        include: {
          faculty: true,
          expertise: true,
          creator: {
            include: {
              role: true
            }
          }
        }
      }),
      this.prisma.topic.count({ where })

    ])

    return {
      data: topic,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    }

  }

  async findOne(id: number) {
    return await this.prisma.topic.findUnique({
      where: {
        topic_id: id,
      },
      include: {
        faculty: true,
        expertise: true,
        creator: {
          include: {
            role: true
          }
        }
      }
    });
  }



  async update(id: number, updateTopicDto: UpdateTopicDto, req: any) {
    const user = req.user
    const topicBigInt = BigInt(id)
    const { description, expertise_id, technologies, title } = updateTopicDto
    const isExisTopic = await this.prisma.topic.findUnique({
      where: { topic_id: topicBigInt },
      include: { faculty: true, capstones: true }
    })
    if (!isExisTopic) {
      throw new BadRequestException('De tai khong ton tai');
    }

    if (isExisTopic.capstones && isExisTopic.capstones.length > 0) {
      throw new BadRequestException('Đề tài này đã được sinh viên nhận làm đồ án, không thể chỉnh sửa!');
    }

    if (expertise_id) {
      const isExistExpertise = await this.prisma.expertise.findUnique({
        where: { expertise_id: BigInt(expertise_id) },
      });
      if (!isExistExpertise) {
        throw new BadRequestException('Hướng chuyên môn không tồn tại');
      }
    }

    const isAdmin = user.role === 'Admin';
    const isDean = isExisTopic.faculty?.dean_id && String(user.id) === String(isExisTopic.faculty.dean_id)

    if (!isAdmin && !isDean) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa đề tài này!');
    }

    return await this.prisma.topic.update({
      where: { topic_id: topicBigInt },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(technologies && { technologies }),
        ...(expertise_id && { expertise_id: BigInt(expertise_id) }),
      },
    });
  }

  async approvedTopic(id: number, updateTopicDto: UpdateTopicDto, req: any) {
    const user = req.user
    const topicBigInt = BigInt(id)
    const isExisTopic = await this.prisma.topic.findUnique({
      where: { topic_id: topicBigInt },
      include: { faculty: true }
    })
    if (!isExisTopic) {
      throw new BadRequestException('De tai khong ton tai');
    }

    if (isExisTopic.status !== "PENDING") {
      throw new BadRequestException('De tai da duoc phe duyet');
    }

    const isAdmin = user.role === 'ADMIN';
    const isDean = isExisTopic.faculty?.dean_id && String(user.id) === String(isExisTopic.faculty.dean_id);

    if (!isAdmin && !isDean) {
      throw new ForbiddenException('Bạn không có quyền phê duyệt đề tài này');
    }

    return await this.prisma.topic.update({
      where: { topic_id: topicBigInt },
      data: {
        status: "APPROVED"
      }
    });
  }

  async remove(id: number, req: any) {
    const user = req.user;
    const topicBigInt = BigInt(id);
    const topic = await this.prisma.topic.findUnique({
      where: { topic_id: topicBigInt },
      include: { faculty: true, capstones: true }
    });

    if (!topic) {
      throw new BadRequestException('Đề tài không tồn tại');
    }

    if (topic.capstones && topic.capstones.length > 0) {
      throw new BadRequestException('Đề tài này đã được sinh viên nhận làm đồ án, không thể xóa!');
    }

    const isAdmin = user.role === 'Admin';
    const isDean = topic.faculty?.dean_id && String(user.id) === String(topic.faculty.dean_id);

    if (!isAdmin && !isDean) {
      throw new ForbiddenException('Bạn không có quyền xóa đề tài này!');
    }

    return await this.prisma.topic.delete({
      where: { topic_id: topicBigInt }
    });
  }
}
