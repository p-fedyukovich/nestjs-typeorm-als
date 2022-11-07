import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Purse } from '../entity/purse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Purse])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
