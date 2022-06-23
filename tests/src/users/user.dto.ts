import { Column } from 'typeorm';

export class UserDto {
  @Column()
  name!: string;
}
