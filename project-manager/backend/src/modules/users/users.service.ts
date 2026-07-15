import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(role?: string) {
    let roleId = role === "Admin" ? 1 : role === "Lecturer" ? 2 : role === "Student" ? 3 : role === "Faculty" ? 4 : undefined;
    return await this.prisma.user.findMany({
      where: {
        role_id: roleId ? roleId : undefined,
      },
      orderBy: {
        created_at: 'desc',
      },
    })
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
