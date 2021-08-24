import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UsePipes,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { RequestTransaction } from '../../lib/typeorm-als.decorators';
import { UserExistsPipe } from './user-exists.pipe';

@Controller()
@RequestTransaction()
export class TypeormAlsController {
  constructor(readonly repository: UserRepository) {}

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
}
