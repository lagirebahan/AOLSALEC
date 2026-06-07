/*eslint-disable*/

import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth('jwt-auth')
@Controller('users')
export class UsersController {
    constructor(private _us : UsersService){ }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/profile')
    getUserById(@Param('id') id:string){
        return this._us.findOne(+id)
    }
}
