import { Injectable } from '@nestjs/common';
import { UserDto } from './user.dto';
import { User } from '../entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(userDto: UserDto): Promise<User> {
    return this.userRepository.save(userDto);
  }

  async getById(userId: number): Promise<User> {
    return await this.userRepository.findOne(userId, {
      relations: ['purses', 'defaultPurse'],
    });
  }
}
