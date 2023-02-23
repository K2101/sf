import {
  IsString,
  IsEnum,
  IsPositive,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Tag } from 'src/product.entity';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsPositive()
  @IsNumber()
  @IsOptional()
  price: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsPositive()
  @IsNumber()
  @IsOptional()
  amount: number;

  @IsOptional()
  @IsEnum(Tag)
  tag: string;
}
