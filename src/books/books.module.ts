import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BookAdminProxy } from './proxies/book-admin.proxy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [BooksController],
  providers: [BooksService, BookAdminProxy],
  imports: [PrismaModule]
})
export class BooksModule {}
