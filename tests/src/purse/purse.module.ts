import { Module } from '@nestjs/common';
import { TypeOrmAlsModule } from '../../../lib';
import { PurseController } from './purse.controller';
import { PurseService } from './purse.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Purse } from '../entity/purse.entity';

@Module({
  imports: [
    TypeOrmAlsModule.forRoot(),
    TypeOrmModule.forFeature([User, Purse]),
  ],
  controllers: [PurseController],
  providers: [PurseService],
  exports: [PurseService],
})
export class PurseModule {}
