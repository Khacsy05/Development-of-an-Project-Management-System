import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCapstonesSubmissionDto } from './dto/create-capstones-submission.dto';
import { UpdateCapstonesSubmissionDto } from './dto/update-capstones-submission.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CapstoneStatus } from '@prisma/client';
import { CapstoneSubmissionQuery } from './dto/query-submission.dto';

@Injectable()
export class CapstonesSubmissionService {
  constructor(private prisma: PrismaService) { }
  create(createCapstonesSubmissionDto: CreateCapstonesSubmissionDto) {
    return 'This action adds a new capstonesSubmission';
  }

  async findAll(query: CapstoneSubmissionQuery) {
    const { lecturer_id, milestone_type } = query;
    const where: any = {};

    if (lecturer_id) {
      where.capstone = {
        lecturer_id: BigInt(lecturer_id)
      };
    }

    if (milestone_type === 'progress') {
      where.milestone_id = {
        not: 4n
      };
    } else if (milestone_type === 'final') {
      where.milestone_id = 4n;
    }

    const submissions = await this.prisma.capstoneSubmission.findMany({
      where,
      include: {
        milestone: true,
        capstone: {
          include: {
            student: true,
            topic: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return submissions.map(sub => {
      const plainSub = JSON.parse(JSON.stringify(sub));
      if (plainSub.capstone && plainSub.capstone.student) {
        plainSub.capstone.student = {
          ...plainSub.capstone.student,
          user: plainSub.capstone.student
        };
      }
      return plainSub;
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} capstonesSubmission`;
  }

  async update(id: number, updateCapstonesSubmissionDto: UpdateCapstonesSubmissionDto, req: any) {
    const {
      status,
      student_note,
      lecturer_note,
      grade,
      file_path
    } = updateCapstonesSubmissionDto;
    const user = req.user
    const submissionIdBigint = BigInt(id);

    // 1. Tìm bản ghi submission kèm cả thông tin milestone và capstone
    const capstoneSubmis = await this.prisma.capstoneSubmission.findUnique({
      where: { submission_id: submissionIdBigint },
      include: {
        capstone: true,
        milestone: true
      }
    });



    if (!capstoneSubmis || !capstoneSubmis.capstone) {
      throw new NotFoundException('Không tìm thấy lượt nộp bài hoặc đồ án liên quan');
    }
    if (user.role === "Student") {
      const now = new Date()
      const deadLine = new Date(capstoneSubmis.milestone.deadline);

      if (now > deadLine) {
        throw new BadRequestException(
          `Đã quá hạn nộp bài! Hạn cuối là: ${deadLine.toLocaleString('vi-VN')}`
        );
      }
    }

    const capstone = capstoneSubmis.capstone;

    return await this.prisma.$transaction(async (tx) => {
      // 2. Cập nhật bản ghi submission
      const updateSubmission = await tx.capstoneSubmission.update({
        where: { submission_id: submissionIdBigint },
        data: {
          status,
          student_note,
          lecturer_note,
          grade,
          file_path
        },
        include: { capstone: true }
      });

      // 3. XÁC ĐỊNH ĐIỀU KIỆN: Chỉ Milestone số 4 (Báo cáo cuối cùng) mới chuyển trạng thái sang DEFENSE_ELIGIBLE
      const isFinalMilestone = capstoneSubmis.milestone_id === BigInt(4);

      // Nếu là milestone cuối VÀ có điểm số VÀ trạng thái đạt -> Chuyển sang DEFENSE_ELIGIBLE
      const isEligibleForDefense = isFinalMilestone && grade !== undefined && grade !== null && status === 'PASSED';

      const nextStatus = isEligibleForDefense ? CapstoneStatus.DEFENSE_ELIGIBLE : capstone.status;
      const finalInstructorGrade = isFinalMilestone ? grade : capstone.instructor_grade;

      // 4. Cập nhật bảng Capstone kèm thông tin Council
      const updatedCapstone = await tx.capstone.update({
        where: { capstone_id: capstone.capstone_id },
        data: {
          instructor_grade: finalInstructorGrade,
          status: nextStatus
        },
        include: {
          council: true
        }
      });

      // 5. BẮT SỰ KIỆN: Nếu đồ án CHUYỂN SANG DEFENSE_ELIGIBLE -> Đẻ sẵn các bản ghi cho Hội đồng chấm
      if (capstone.status !== CapstoneStatus.DEFENSE_ELIGIBLE && nextStatus === CapstoneStatus.DEFENSE_ELIGIBLE) {
        const councilId = updatedCapstone.council_id;
        // Kiểm tra an toàn: Đồ án phải được gán council_id trước đó thì mới đẻ phiếu chấm được
        if (councilId) {

          // Check xem đã tạo phiếu chấm cho đồ án này lần nào chưa
          const existingCouncilEvaluation = await tx.councilEvaluation.findFirst({
            where: { capstone_id: capstone.capstone_id }
          });

          if (!existingCouncilEvaluation) {
            // Lấy tất cả thành viên thuộc Hội đồng này ra
            const allMembers = await tx.councilMember.findMany({
              where: { council_id: councilId }
            });

            // Duyệt qua từng thành viên để tạo phiếu chấm điểm rỗng cho họ
            if (allMembers.length > 0) {
              const evaluationPromises = allMembers.map((member) => {
                return tx.councilEvaluation.create({
                  data: {
                    capstone_id: capstone.capstone_id,
                    members_id: member.lecturer_id,
                    council_id: councilId
                  }
                });
              });

              await Promise.all(evaluationPromises);
            }
          }
        }
      }

      return updateSubmission;
    });
  }

  remove(id: number) {
    return `This action removes a #${id} capstonesSubmission`;
  }
}
