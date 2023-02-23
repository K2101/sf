import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ nullable: true })
  bio: string;

  @Column()
  createAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  role: string;
}
