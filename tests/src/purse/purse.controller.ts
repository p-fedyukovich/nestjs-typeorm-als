import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { PurseDto } from './purse.dto';
import { PurseService } from './purse.service';
import { BalanceValueDto } from './balance-value.dto';
import { Purse } from '../entity/purse.entity';
import { RequestTransaction } from '../../../lib';

@Controller()
export class PurseController {
  constructor(
    private readonly purses: PurseService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get('/purse/:purseId')
  async getById(@Param('purseId') purseId: string): Promise<Purse> {
    const purseIdNum = Number(purseId);
    return await this.purses.getById(purseIdNum);
  }

  @Post('purse/:userId')
  @RequestTransaction()
  async createPurseForUser(
    @Param('userId') userId: string,
    @Body() purseDto: PurseDto,
  ): Promise<Purse> {
    const userIdNum = Number(userId);
    return await this.purses.create(purseDto, userIdNum);
  }

  @Patch('purse/:purseId/top-up')
  @RequestTransaction()
  async topUpPurse(
    @Param('purseId') purseId: string,
    @Body() balanceValue: BalanceValueDto,
  ): Promise<Purse> {
    const purseIdNum = Number(purseId);
    return this.purses.topUp(purseIdNum, balanceValue.sum);
  }
}
