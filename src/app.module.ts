/*eslint-disable*/

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','..', 'public'),
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
    PassportModule.register({
        defaultStrategy:'jwt'
    }),
    BooksModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
