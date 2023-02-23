import {
  IsString,
  IsPositive,
  IsNumber,
  IsNotEmpty,
  IsDate,
} from 'class-validator';

export class ProductCreateDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsDate()
  createAt: Date;
}
