import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsPositive,
  IsNumber,
} from 'class-validator';
import { Tag } from 'src/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(Tag)
  tag: string;
}
