import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OrderEntity {
  @PrimaryColumn({ unique: true })
  orderId: string;

  @Column()
  userId: string;

  @Column({ type: 'json' })
  productIds: string[];

  @Column({ type: 'json' })
  productNames: string[];

  @Column({ type: 'decimal' })
  totalPrice: number;

  @Column()
  totalAmount: number;

  @Column()
  createAt: Date;

  @Column()
  status: string;
}
