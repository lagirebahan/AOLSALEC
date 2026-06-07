import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { BookBuilder } from './builders/book.builder';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: number) {
    const books = await this.prisma.book.findMany();

    const booksWithStatus = await Promise.all(
      books.map(async (book) => {
        const activeBorrows = await this.prisma.borrow.count({
          where: { bookId: book.id, returnedAt: null },
        });

        const userBorrowing = userId
          ? await this.prisma.borrow.count({
              where: { bookId: book.id, userId, returnedAt: null },
            })
          : 0;

        return {
          ...book,
          availableCopies: book.totalCopies - activeBorrows,
          userBorrowing: userBorrowing > 0,
        };
      }),
    );

    // Sort: green (available, not borrowing) → yellow (user borrowing) → red (no stock) → alphanumeric
    return booksWithStatus.sort((a, b) => {
      const rank = (book) => {
        if (book.userBorrowing) return 1;
        if (book.availableCopies <= 0) return 2;
        return 0;
      };
      const diff = rank(a) - rank(b);
      return diff !== 0 ? diff : a.title.localeCompare(b.title);
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException('Book does not exist');
    }

    return book;
  }

  async create(data: CreateBookDto) {
    const bookData = new BookBuilder()
      .setTitle(data.title)
      .setAuthor(data.author)
      .setTotalCopies(data.totalCopies ?? 1)
      .build();

    return this.prisma.book.create({
      data: bookData,
    });
  }

  async update(id: number, data: UpdateBookDto) {
    await this.findOne(id);

    return this.prisma.book.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.book.delete({
      where: { id },
    });
  }

  async search(title: string) {
    return this.prisma.book.findMany({
      where: {
        title: {
          contains: title,
        },
      },
    });
  }

  async borrowBook(bookId: number, userId: number) {
    const book = await this.findOne(bookId);

    const activeBorrows = await this.prisma.borrow.count({
      where: {
        bookId,
        returnedAt: null,
      },
    });

    if (activeBorrows >= book.totalCopies) {
      throw new BadRequestException(
        'No copies available',
      );
    }

    return this.prisma.borrow.create({
      data: {
        userId,
        bookId,
      },
    });
  }

  async returnBook(bookId: number, userId: number) {
    const borrow = await this.prisma.borrow.findFirst({
      where: {
        bookId,
        userId,
        returnedAt: null,
      },
    });

    if (!borrow) {
      throw new BadRequestException(
        'Book not currently borrowed',
      );
    }

    return this.prisma.borrow.update({
      where: {
        id: borrow.id,
      },
      data: {
        returnedAt: new Date(),
      },
    });
  }
}