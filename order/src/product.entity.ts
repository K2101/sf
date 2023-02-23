import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ProductEntity {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column()
  title: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column()
  description: string;

  @Column()
  amount: number;

  @Column()
  createAt: Date;
}
