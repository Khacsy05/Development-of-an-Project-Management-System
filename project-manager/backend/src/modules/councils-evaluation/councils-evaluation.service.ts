import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouncilEvalutionDto } from './dto/create-council-evalution.dto';
import { UpdateCouncilEvalutionDto } from './dto/update-council-evalution.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CapstoneStatus } from '@prisma/client';

@Injectable()
export class CouncilEvalutionService {
  constructor(private prisma : PrismaService){}
  create(createCouncilEvalutionDto: CreateCouncilEvalutionDto) {
    return 'This action adds a new councilEvalution';
  }

  findAll() {
    return `This action returns all councilEvalution`;
  }

  findOne(id: number) {
    return `This action returns a #${id} councilEvalution`;
  }

  async update(id: number, updateCouncilEvalutionDto: UpdateCouncilEvalutionDto,req: any) {
    const user = req.user as any
    const {grade,lecturer_note} = updateCouncilEvalutionDto
    const evalutionBigInt = BigInt(id)
    const councilEvaluation = await this.prisma.councilEvaluation.findUnique({
      where: {evalution_id: evalutionBigInt},
      include: {
        capstone: true,
        council: {
          include: {
            members: true
          }
        },
      }
    })
    if (!councilEvaluation || !councilEvaluation.capstone || !councilEvaluation.council) {
      throw new NotFoundException('Phiếu đánh giá hội đồng không tồn tại');
    }
    const council = councilEvaluation.council;

// 1. Kiểm tra nếu Council chưa được thiết lập thời gian bảo vệ
    if (!council.start_date || !council.end_date) {
      throw new BadRequestException('Hội đồng này chưa được thiết lập thời gian bảo vệ!');
    }

    const now = new Date();

    // Sau khi đã check !start_date ở trên, TypeScript sẽ tự hiểu start_date CHẮC CHẮN không null
    if (now < council.start_date) {
      throw new BadRequestException('Chưa đến thời gian bắt đầu bảo vệ!');
    }

    if (now > council.end_date) {
      throw new BadRequestException('Đã hết thời gian nhập điểm cho hội đồng này!');
    }

    if(String(user.id) !== String(councilEvaluation?.members_id)){
      throw new BadRequestException('Bạn không phải giảng viên được chỉ định trong hội đồng này');
    }
    return this.prisma.$transaction (async (tx) => {
      const councilUpdate = await tx.councilEvaluation.update({
        where: {
          evalution_id: evalutionBigInt,
        },
        data : {
          grade: grade,
          lecturer_note: lecturer_note
        }
      })

      const allEvaluations = await tx.councilEvaluation.findMany({
        where: { 
          capstone_id :  councilEvaluation?.capstone_id,
          grade: {
            not: null 
          }
        }
      });

      const totalMembers = councilEvaluation?.council?.members.length;

      if(allEvaluations.length === totalMembers){

        const sumGrade = allEvaluations.reduce((sum,Item) => sum + (Item.grade ?? 0), 0)
        const averageGrade = Math.round((sumGrade / totalMembers) * 100) / 100;
        const finalStatus = averageGrade >= 4.0 ? CapstoneStatus.COMPLETED : CapstoneStatus.FAILED;
        await tx.capstone.update({
          where: {capstone_id: councilEvaluation?.capstone_id},
          data: {
            council_grade: averageGrade,
            status: finalStatus
          }
        })
      }
      return councilUpdate
    })
  }

  remove(id: number) {
    return `This action removes a #${id} councilEvalution`;
  }
}
