/*eslint-disable*/

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getBorrowHistory(id: number) {
    return this.prisma.borrow.findMany({
      where: {
        userId: id,
      },
      include: {
        book: true,
      },
      orderBy: {
        borrowedAt: 'desc',
      },
    });
  }

  async deleteUser(id: number) {
    const user = await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return user;
  }
}
