import {
  IsString,
  IsPositive,
  IsNumber,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class ProductUpdateDto {
  @IsString()
  @IsNotEmpty()
  id: string;

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

  @IsOptional()
  @IsPositive()
  @IsNumber()
  amount: number;
}
