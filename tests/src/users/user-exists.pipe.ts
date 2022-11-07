import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserExistsPipe implements PipeTransform {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async transform(body: any, metadata: ArgumentMetadata): Promise<any> {
    const user = await this.userRepository.findOneBy({ name: body.name });

    if (user) {
      throw new BadRequestException('User already exists');
    }

    return body;
  }
}
