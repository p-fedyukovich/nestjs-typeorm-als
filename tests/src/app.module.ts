import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Purse } from './entity/purse.entity';
import { TypeOrmAlsModule } from '../../lib';
import { PurseModule } from './purse/purse.module';
import { UserModule } from './users/user.module';
import { RemittanceModule } from './remittance/remittance.module';
import { Remittance } from './entity/remittance.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      entities: [User, Purse, Remittance],
      synchronize: true,
      logging: 'all',
    }),
    TypeOrmAlsModule.forRoot(),
    UserModule,
    PurseModule,
    RemittanceModule,
  ],
})
export class AppModule {}
