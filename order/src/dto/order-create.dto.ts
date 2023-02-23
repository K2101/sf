import {
  IsString,
  IsPositive,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';

export enum Status {
  Pending = 'PENDING',
  Success = 'SUCCESS',
  Cancel = 'CANCEL',
}

export class OrderCreateDto {
  @IsNotEmpty()
  productsId: string[];
}
