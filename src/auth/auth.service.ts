import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor (private _jwtService: JwtService, private _prisma: PrismaService){

    }
    async login(body:LoginDTO){
        const user = await this._prisma.user.findFirst({
            where: { name: body.name }, 
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isMatch = await bcrypt.compare(body.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid password');
        }

        const payload = {sub: user.id, role: user.role}
        const access_token = await this._jwtService.signAsync(payload)
        return access_token
    }

    async register(body:RegisterDTO){
        const existuser = await this._prisma.user.findUnique({
            where:{
                email:body.email,
            },
        });

        if(existuser){
            throw new ConflictException('Email already exists')
        }

        const hashedPassword = await bcrypt.hash(
            body.password,
            10,
        );

        await this._prisma.user.create({
            data:{
                name: body.username,
                email: body.email,
                password: hashedPassword,
                role: 'USER',
            },
        })

        return {
            message: 'User registered successfully',
        };
    }
}
