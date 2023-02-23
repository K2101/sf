import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum Tag {
  Food = 'FOOD',
  Equipment = 'EQUIPMENT',
  Electronic = 'ELECTRONIC',
  Utils = 'UTILS',
  Etc = 'ETC',
}

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

  @Column()
  tag: string;

  // for client upload to s3.
  // @Column()
  // photo: string
}
