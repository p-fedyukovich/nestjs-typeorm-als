import { Body, Controller, Post } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Transactional } from '../../lib/transactional.decorator';

@Controller()
export class TypeormAlsController {
  constructor(readonly repository: UserRepository) {}

  @Post()
  @Transactional()
  async createUser(@Body() data: any): Promise<User> {
    const user = await this.repository.save(data);
    await this.repository.findOne(user.id);
    return user;
  }
}
