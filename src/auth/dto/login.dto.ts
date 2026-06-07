import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDTO{
    @ApiProperty()
    @IsString()
    @MinLength(1)
    name!: string;
    @ApiProperty()
    @IsString()
    @MinLength(1)
    password!: string;
}