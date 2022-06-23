import { EntityRepository, Repository } from 'typeorm';
import { Remittance } from '../entity/remittance.entity';

@EntityRepository(Remittance)
export class RemittanceRepository extends Repository<Remittance> {}
