import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserQueryDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(query: UserQueryDto) {
    const { role, fullname, page = 1, limit = 7 } = query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 7);
    const normalizedFullname = fullname?.trim();
    const roleId = this.mapRoleToId(role);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      role_id: roleId,
      
      fullname: fullname? {
        contains: normalizedFullname,
        mode: 'insensitive' as const,
      } : undefined
    }
    

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: [
          {
            created_at: 'desc',
          },
          {
            user_id: 'desc',
          },
        ],
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  private mapRoleToId(role?: string): number | undefined {
    const roleMap: Record<string, number> = {
      Admin: 1,
      Lecturer: 2,
      Student: 3,
      Faculty: 4,
    };

    return role ? roleMap[role] : undefined;
  }

  async findOne(id: number) {
    return await this.prisma.user.findUnique({
      where: {
        user_id: id,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
