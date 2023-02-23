import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AuthEntity {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  role: string;

  @Column({ unique: true })
  username: string;

  @Column()
  createAt: Date;
}
