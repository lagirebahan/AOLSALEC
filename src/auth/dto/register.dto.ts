import { ApiProperty } from "@nestjs/swagger";
import {IsEmail, IsString, Matches, MaxLength, MinLength} from 'class-validator';

export class RegisterDTO{
    @ApiProperty()
    @IsString()
    @MinLength(4)
    @MaxLength(40)
    username!: string;
    
    @ApiProperty()
    @IsEmail()
    email!: string;

    @ApiProperty()
    @MinLength(8)
    @MaxLength(40)
    @Matches(/[A-Z]/, {
        message: 'Password must contain an uppercase letter',
    })
    @Matches(/[a-z]/, {
        message: 'Password must contain a lowercase letter',
    })
    @Matches(/[0-9]/, {
        message: 'Password must contain a number',
    })
    @Matches(/[^A-Za-z0-9]/, {
        message: 'Password must contain a special character',
    })
    password!: string;
}