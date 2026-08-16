import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserQueryDto } from './dto/query-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }
  async create(createUserDto: CreateUserDto) {
    const {
      email,
      fullname,
      faculty_id,
      gender,
      phone_number,
      class_id,
      role_id,
      usercode,
      username,
      password,
    } = createUserDto;

    // Check email/username/usercode conflicts
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
          { usercode },
        ]
      }
    });

    if (existingUser) {
      throw new BadRequestException('Email, tên đăng nhập hoặc mã người dùng đã tồn tại!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        fullname,
        username,
        usercode,
        password: hashedPassword,
        gender,
        phone_number,
        role_id: BigInt(role_id),
        faculty_id: faculty_id ? BigInt(faculty_id) : null,
        first_login: true,
      }
    });

    // Create StudentProfile if student role
    if (String(role_id) === '3' && class_id) {
      await this.prisma.studentProfile.create({
        data: {
          user_id: newUser.user_id,
          class_id: BigInt(class_id),
        }
      });
    }

    return newUser;
  }

  async findAll(query: UserQueryDto) {
    const { role, fullname, page = 1, limit = 7, faculty_id } = query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 7);
    const normalizedFullname = fullname?.trim();
    const roleId = this.mapRoleToId(role);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {
      role_id: roleId ? BigInt(roleId) : { in: [BigInt(2), BigInt(3)] },
    };

    if (faculty_id) {
      where.faculty_id = BigInt(faculty_id);
    }

    if (normalizedFullname) {
      where.OR = [
        { fullname: { contains: normalizedFullname } },
        { usercode: { contains: normalizedFullname } },
      ];
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
        include: {
          role: true,
          faculty: true,
          student: {
            include: {
              class: true
            }
          }
        }
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
      include: {
        role: true,
        faculty: true,
        student: {
          include: {
            class: true
          }
        }
      }
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const {
      email,
      fullname,
      faculty_id,
      gender,
      phone_number,
      class_id,
      role_id,
      is_active,
    } = updateUserDto;

    const user = await this.prisma.user.findUnique({
      where: { user_id: BigInt(id) }
    });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    const checkOr: any[] = [];
    if (email && email !== user.email) checkOr.push({ email });
    if (checkOr.length > 0) {
      const duplicate = await this.prisma.user.findFirst({
        where: {
          OR: checkOr
        }
      });
      if (duplicate) {
        throw new BadRequestException('Email, tên đăng nhập hoặc mã người dùng đã bị trùng!');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { user_id: BigInt(id) },
      data: {
        ...(email && { email }),
        ...(fullname && { fullname }),
        ...(gender && { gender }),
        ...(phone_number && { phone_number }),
        ...(role_id && { role_id: BigInt(role_id) }),
        ...(faculty_id !== undefined && { faculty_id: faculty_id ? BigInt(faculty_id) : null }),
        ...(is_active !== undefined && { is_active }),
      }
    });

    if (class_id) {
      await this.prisma.studentProfile.upsert({
        where: { user_id: BigInt(id) },
        update: {
          class_id: BigInt(class_id),
        },
        create: {
          user_id: BigInt(id),
          class_id: BigInt(class_id),
        }
      });
    }

    return updatedUser;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
