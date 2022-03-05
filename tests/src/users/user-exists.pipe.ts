import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserExistsPipe implements PipeTransform {
  constructor(private readonly userRepository: UserRepository) {}

  async transform(body: any, metadata: ArgumentMetadata): Promise<any> {
    const user = await this.userRepository.findOne({ name: body.name });

    if (user) {
      throw new BadRequestException('User already exists');
    }

    return body;
  }
}
