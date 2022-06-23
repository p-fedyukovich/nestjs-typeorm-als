import { EntityRepository, Repository } from 'typeorm';
import { Purse } from '../entity/purse.entity';

@EntityRepository(Purse)
export class PurseRepository extends Repository<Purse> {}
