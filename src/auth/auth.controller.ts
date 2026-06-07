import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RegisterDTO } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService){ }

    @Post('login')
    @ApiBody({
        description:"Login to access the Library system",
        type: LoginDTO,
    })
    async login(@Body() body: LoginDTO){
        return this.authService.login(body)
    }

    @Post('register')
    @ApiBody({
        description:"Register an new Library account",
        type: RegisterDTO,
    })
    async register(@Body() body:RegisterDTO){
        return this.authService.register(body)
    }
}
