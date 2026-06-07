import {Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { BooksService } from './books.service';
import { BookAdminProxy } from './proxies/book-admin.proxy';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';

@ApiTags('Books')
@ApiBearerAuth('jwt-auth')
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly bookAdminProxy: BookAdminProxy,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Req() req) {
    const userId = req.user?.userId ?? null;
    return this.booksService.findAll(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Req() req,
    @Body() dto : CreateBookDto,
  ) {
    return this.bookAdminProxy.createBook(
      req.user.role,
      dto,
    );
  }

  @ApiBearerAuth('jwt-auth')
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto : UpdateBookDto,
  ) {
    return this.bookAdminProxy.updateBook(
      req.user.role,
      +id,
      dto,
    );
  }

  @ApiBearerAuth('jwt-auth')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.bookAdminProxy.deleteBook(
      req.user.role,
      +id,
    );
  }

  @ApiBearerAuth('jwt-auth')
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/borrow')
  borrow(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.booksService.borrowBook(
      +id,
      req.user.userId,
    );
  }

  @ApiBearerAuth('jwt-auth')
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/return')
  returnBook(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.booksService.returnBook(
      +id,
      req.user.userId,
    );
  }
}