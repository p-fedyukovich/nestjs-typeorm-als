import { Injectable } from '@nestjs/common';
import { Remittance } from '../entity/remittance.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NOT_ENOUGH_MONEY, NOT_FOUND_USER_WITH_ID, USER_DOES_NOT_HAVE_PURSE } from '../errors/errors';
import { UserService } from '../users/user.service';
import { PurseService } from '../purse/purse.service';
import { RemittanceRepository } from './remittance.repository';
import { RemittanceResultDto } from './remittance-result.dto';

@Injectable()
export class RemittanceService {
  public constructor(
    private readonly users: UserService,
    private readonly purses: PurseService,
    @InjectRepository(Remittance) private readonly remittance: RemittanceRepository,
  ) {}

  async makeRemittance(fromId: number, toId: number, sum: number, withError = false): Promise<RemittanceResultDto> {
    const fromUser = await this.users.getById(fromId);
    const toUser = await this.users.getById(toId);
    if (fromUser === undefined) {
      throw new Error(NOT_FOUND_USER_WITH_ID(fromId));
    }
    if (toUser === undefined) {
      throw new Error(NOT_FOUND_USER_WITH_ID(toId));
    }
    if (fromUser.defaultPurseId === null) {
      throw new Error(USER_DOES_NOT_HAVE_PURSE(fromId));
    }
    if (toUser.defaultPurseId === null) {
      throw new Error(USER_DOES_NOT_HAVE_PURSE(toId));
    }
    const fromPurse = await this.purses.getById(fromUser.defaultPurseId);
    const toPurse = await this.purses.getById(toUser.defaultPurseId);
    const modalSum = Math.abs(sum);
    if (fromPurse.balance < modalSum) {
      throw new Error(NOT_ENOUGH_MONEY(fromId));
    }
    const fromBalanceBefore = fromPurse.balance;
    const toBalanceBefore = toPurse.balance;

    fromPurse.balance -= sum;
    toPurse.balance += sum;

    const fromBalanceAfter = fromPurse.balance;
    const toBalanceAfter = toPurse.balance;

    await this.purses.save(fromPurse);
    if (withError) {
      throw new Error('Unexpectable error was thrown while remittance');
    }
    await this.purses.save(toPurse);
    const remittance = new Remittance();

    remittance.from = {
      userId: fromId,
      purseId: fromPurse.id,
      balanceBefore: fromBalanceBefore,
      balanceAfter: fromBalanceAfter,
    };
    remittance.to = {
      userId: toId,
      purseId: fromPurse.id,
      balanceBefore: toBalanceBefore,
      balanceAfter: toBalanceAfter,
    }
    /*
    remittance.fromUserId = fromId;
    remittance.fromPurseId = fromPurse.id;
    remittance.fromBalanceBefore = fromBalanceBefore;
    remittance.fromBalanceAfter = fromBalanceAfter;

    remittance.toUserId = toId;
    remittance.toPurseId = toPurse.id;
    remittance.toBalanceBefore = toBalanceBefore;
    remittance.toBalanceAfter = toBalanceAfter;
    */
    remittance.sum = sum;
    const resultRemittance = await this.remittance.save(remittance);

    const result = new RemittanceResultDto();
    result.id = resultRemittance.id;
    result.sum = sum;
    result.fromId = fromId;
    result.toId = toId;
    result.fromBalance = fromBalanceAfter;

    return result;
  }
}
