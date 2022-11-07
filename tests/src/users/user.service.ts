import { Injectable } from '@nestjs/common';
import { UserDto } from './user.dto';
import { User } from '../entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from '../../../lib';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(userDto: UserDto): Promise<User> {
    return this.userRepository.save(userDto);
  }

  async getById(userId: number): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['purses', 'defaultPurse'],
    });
  }

  @Transactional()
  async createAndGet(userDto: UserDto): Promise<User> {
    const user = await this.create(userDto);
    return this.getById(user.id);
  }
}
