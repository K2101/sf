import { PrimaryColumn, Column, Entity } from 'typeorm';

export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
}

@Entity()
export class UserEntity {
  @PrimaryColumn({ unique: true })
  id: string;
  @Column()
  role: string;
}
