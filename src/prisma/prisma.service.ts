import { Injectable } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient{
    constructor(){
        const adapter = new PrismaMariaDb({
            host:"localhost",
            port:3306,
            user:"root",
            password:'',
            database:"library_db",
        });
        super({adapter});
    }
}
