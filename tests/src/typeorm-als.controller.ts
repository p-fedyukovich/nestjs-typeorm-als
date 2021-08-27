import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UsePipes,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { RequestTransaction } from '../../lib';
import { UserExistsPipe } from './user-exists.pipe';

@Controller()
@RequestTransaction()
export class TypeormAlsController {
  constructor(
    readonly repository: UserRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Post()
  @UsePipes(UserExistsPipe)
  async createUser(@Body() data: any): Promise<User> {
    const user = await this.repository.save(data);
    return this.repository.findOne(user.id);
  }

  @Get()
  async getUser(): Promise<User> {
    throw new InternalServerErrorException('Internal Server Error');
  }

  @Post('/builder')
  @UsePipes(UserExistsPipe)
  async createUserBuilder(@Body() data: any): Promise<User> {
    const insertBuilder = this.connection.createQueryBuilder(User, 'user');
    const user = await insertBuilder.insert().values(data).execute();
    const selectBuilder = this.connection.createQueryBuilder(User, 'user');
    return selectBuilder
      .where('user.id = :userId', {
        userId: user.identifiers[0].id,
      })
      .getOne();
  }
}
