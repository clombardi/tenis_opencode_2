import { IsString, IsEmail, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { PlayerGender, Hand } from '@prisma/client';

export class CreatePlayerDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsEnum(PlayerGender)
  gender!: PlayerGender;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsEnum(Hand)
  mano?: Hand;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsEnum(Hand)
  mano?: Hand;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}

export class PlayerQueryDto {
  @IsOptional()
  @IsEnum(PlayerGender)
  gender?: PlayerGender;

  @IsOptional()
  @IsString()
  country?: string;
}
