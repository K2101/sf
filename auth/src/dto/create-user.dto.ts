import { IsEmail, IsString, IsEnum, IsNotEmpty } from 'class-validator';

export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
}

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}

import { Expose } from 'class-transformer';
export class UserDto {
  @Expose()
  email: string;
  @Expose()
  username: string;
  @Expose()
  role: string;
  @Expose()
  isReadyToBuy: boolean;
  @Expose()
  isActive: boolean;
}
