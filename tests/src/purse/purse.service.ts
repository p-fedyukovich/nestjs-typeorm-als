import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { UserRepository } from '../users/user.repository';
import { Purse } from '../entity/purse.entity';
import { PurseRepository } from './purse.repository';
import { PurseDto } from './purse.dto';
import {
  NOT_FOUND_PURSE_WITH_PURSE_ID,
  NOT_FOUND_USER_WITH_ID,
} from '../errors/errors';
import { classToPlain, plainToClass } from 'class-transformer';

@Injectable()
export class PurseService {
  constructor(
    @InjectRepository(User) private readonly users: UserRepository,
    @InjectRepository(Purse) private readonly purses: PurseRepository,
  ) {}

  async create(purseDto: PurseDto, userId: number): Promise<Purse> {
    const user = await this.users.findOne(userId);
    if (user === undefined) {
      throw new Error(NOT_FOUND_USER_WITH_ID(userId));
    }
    let purse: Purse = plainToClass(Purse, classToPlain(purseDto));
    purse.userId = userId;
    purse = await this.purses.save(purse);
    if (user.defaultPurseId === null) {
      user.defaultPurseId = purse.id;
      await this.users.save(user);
    }
    return purse;
  }

  async topUp(purseId: number, sum: number): Promise<Purse> {
    const purse = await this.purses.findOne(purseId);
    if (purse === undefined) {
      throw new Error(NOT_FOUND_PURSE_WITH_PURSE_ID(purseId));
    }
    if (sum < 1) {
      throw new Error('The sum cannot be less than 1');
    }
    purse.balance += sum;
    return this.purses.save(purse);
  }

  async getById(userId: number): Promise<Purse> {
    return await this.purses.findOne(userId);
  }

  async save(purse: Purse): Promise<Purse> {
    return await this.purses.save(purse);
  }
}
