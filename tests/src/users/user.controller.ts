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

import { User } from '../entity/user.entity';
import { RequestTransaction } from '../../../lib';
import { UserExistsPipe } from './user-exists.pipe';
import { UserDto } from './user.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(
    private readonly users: UserService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Post()
  @UsePipes(UserExistsPipe)
  @RequestTransaction()
  async createUser(@Body() userDto: UserDto): Promise<User> {
    const user = await this.users.create(userDto);
    return await this.users.getById(user.id);
  }

  @Get()
  @RequestTransaction()
  async getUser(): Promise<User> {
    throw new InternalServerErrorException('Internal Server Error');
  }

  @Post('/builder')
  @UsePipes(UserExistsPipe)
  @RequestTransaction()
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
