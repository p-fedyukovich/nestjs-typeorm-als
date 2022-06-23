import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Purse } from './purse.entity';

class RemittanceDetails {
  @Column({ nullable: false })
  @OneToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  userId: number;

  @Column({ nullable: false })
  @OneToOne(() => Purse, (purse) => purse.id, { onDelete: 'CASCADE' })
  purseId: number;

  @Column({ nullable: false })
  balanceBefore: number;

  @Column({ nullable: false })
  balanceAfter: number;
}

@Entity({ name: 'remittance' })
export class Remittance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, default: 0, type: 'integer' })
  sum!: number;

  @Column(() => RemittanceDetails)
  from: RemittanceDetails;

  @Column(() => RemittanceDetails)
  to: RemittanceDetails;

  /*
  @Column({nullable: false})
  @OneToOne(() => User, user => user.id, {onDelete: "CASCADE"})
  fromUserId: number;

  @Column({nullable: false})
  @OneToOne(() => Purse, purse => purse.id, {onDelete: "CASCADE"})
  fromPurseId: number;

  @Column({nullable: false})
  fromBalanceBefore: number;

  @Column({nullable: false})
  fromBalanceAfter: number;

  @Column({nullable: false})
  @OneToOne(() => User, user => user.id, {onDelete: "CASCADE"})
  toUserId: number;

  @Column({nullable: false})
  @OneToOne(() => Purse, purse => purse.id, {onDelete: "CASCADE"})
  toPurseId: number;

  @Column({nullable: false})
  toBalanceBefore: number;

  @Column({nullable: false})
  toBalanceAfter: number;
   */
}
