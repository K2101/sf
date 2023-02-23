import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
}

@Entity()
export class UserEntity {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column()
  isActive: boolean;

  @Column()
  role: string;
}
