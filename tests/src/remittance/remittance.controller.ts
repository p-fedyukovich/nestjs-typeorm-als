import { Body, Controller, Post } from '@nestjs/common';
import { RemittanceService } from './remittance.service';
import { RemittanceDto } from './remittance.dto';
import { RemittanceResultDto } from './remittance-result.dto';
import { RequestTransaction } from '../../../lib';

@Controller()
export class RemittanceController {
  public constructor(private readonly rem: RemittanceService) {}

  @Post('remittance/remittance-with-transaction')
  @RequestTransaction()
  async makeRemittanceWithTransaction(
    @Body() remittanceDto: RemittanceDto,
  ): Promise<RemittanceResultDto> {
    return await this.rem.makeRemittance(
      remittanceDto.userIdFrom,
      remittanceDto.userIdTo,
      remittanceDto.sum,
      remittanceDto.withError,
    );
  }
}
