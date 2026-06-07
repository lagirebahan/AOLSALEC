import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import { BooksService } from '../books.service';

@Injectable()
export class BookAdminProxy {
  constructor(
    private readonly booksService: BooksService,
  ) {}

  async createBook(userRole: string, dto: any) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admins can create books',
      );
    }

    return this.booksService.create(dto);
  }

  async updateBook(
    userRole: string,
    id: number,
    dto: any,
  ) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admins can update books',
      );
    }

    return this.booksService.update(id, dto);
  }

  async deleteBook(
    userRole: string,
    id: number,
  ) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admins can delete books',
      );
    }

    return this.booksService.remove(id);
  }
}