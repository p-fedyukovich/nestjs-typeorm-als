import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Remittance } from '../entity/remittance.entity';
import { RemittanceRepository } from './remittance.repository';
import { RemittanceController } from './remittance.controller';
import { RemittanceService } from './remittance.service';
import { UserModule } from '../users/user.module';
import { PurseModule } from '../purse/purse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Remittance, RemittanceRepository]),
    UserModule,
    PurseModule,
  ],
  controllers: [RemittanceController],
  providers: [RemittanceService],
})
export class RemittanceModule {}
