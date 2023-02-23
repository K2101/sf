import {
  IsString,
  IsPositive,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Status } from './order-create.dto';

export class OrderUpdateDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsOptional()
  productsId: string[];

  @IsOptional()
  productsName: string[];

  @IsPositive()
  @IsNumber()
  @IsOptional()
  totalPrice: number;

  @IsPositive()
  @IsNumber()
  @IsOptional()
  totalAmount: number;
}

export class OrderUpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;
}
