import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  surname: string;

  @IsString()
  @IsOptional()
  bio: string;
}
