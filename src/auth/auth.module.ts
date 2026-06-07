import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports:[
    PrismaModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: "1h"
        }
      })
      
      
    })
  ]
})
export class AuthModule {}
